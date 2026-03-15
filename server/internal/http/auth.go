package httpapi

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"kin-surge/server/internal/config"
	"kin-surge/server/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const authCookieName = "kin_surge_session"

type authHandler struct {
	db     *gorm.DB
	config config.Config
}

type authClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

type authResponse struct {
	User models.User `json:"user"`
}

type registerRequest struct {
	Username    string `json:"username"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"display_name"`
}

type loginRequest struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

func newAuthHandler(db *gorm.DB, cfg config.Config) authHandler {
	return authHandler{db: db, config: cfg}
}

func (h authHandler) register(c *gin.Context) {
	var input registerRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数不正确"})
		return
	}

	username := sanitizeHandle(input.Username)
	displayName := strings.TrimSpace(input.DisplayName)
	password := strings.TrimSpace(input.Password)
	if username == "" || displayName == "" || len(password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户名、显示名称和不少于 6 位的密码是必填项"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码处理失败"})
		return
	}

	email := normalizeOptional(input.Email)
	user := models.User{
		ID:           newID(),
		Username:     username,
		Email:        email,
		PasswordHash: string(hash),
		DisplayName:  displayName,
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "用户名或邮箱已存在"})
		return
	}

	h.writeSessionCookie(c, user.ID)
	c.JSON(http.StatusCreated, authResponse{User: user})
}

func (h authHandler) login(c *gin.Context) {
	var input loginRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数不正确"})
		return
	}

	identifier := strings.TrimSpace(input.Identifier)
	password := strings.TrimSpace(input.Password)
	if identifier == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请输入账号和密码"})
		return
	}

	var user models.User
	err := h.db.Where("username = ? OR email = ?", identifier, strings.ToLower(identifier)).First(&user).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "账号或密码错误"})
		return
	}
	if user.PasswordHash == "" || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "账号或密码错误"})
		return
	}

	h.writeSessionCookie(c, user.ID)
	c.JSON(http.StatusOK, authResponse{User: user})
}

func (h authHandler) guest(c *gin.Context) {
	timestamp := time.Now().UnixNano()
	username := fmt.Sprintf("guest_%d", timestamp%1_000_000)
	user := models.User{
		ID:          newID(),
		Username:    username,
		DisplayName: fmt.Sprintf("游客%s", username[len(username)-4:]),
		IsGuest:     true,
	}
	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建游客失败"})
		return
	}

	h.writeSessionCookie(c, user.ID)
	c.JSON(http.StatusCreated, authResponse{User: user})
}

func (h authHandler) logout(c *gin.Context) {
	c.SetCookie(authCookieName, "", -1, "/", "", h.config.IsProduction(), true)
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h authHandler) me(c *gin.Context) {
	user, exists := currentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}
	c.JSON(http.StatusOK, authResponse{User: user})
}

func (h authHandler) authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(authCookieName)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
			return
		}

		userID, err := h.parseToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "登录已失效"})
			return
		}

		var user models.User
		if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "用户不存在"})
			return
		}

		c.Set("currentUser", user)
		c.Next()
	}
}

func currentUser(c *gin.Context) (models.User, bool) {
	value, exists := c.Get("currentUser")
	if !exists {
		return models.User{}, false
	}

	user, ok := value.(models.User)
	return user, ok
}

func (h authHandler) writeSessionCookie(c *gin.Context, userID string) {
	token, err := h.issueToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成登录状态失败"})
		return
	}

	maxAge := int((7 * 24 * time.Hour).Seconds())
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(authCookieName, token, maxAge, "/", "", h.config.IsProduction(), true)
}

func (h authHandler) issueToken(userID string) (string, error) {
	claims := authClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.config.JWTSecret))
}

func (h authHandler) parseToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &authClaims{}, func(token *jwt.Token) (any, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(h.config.JWTSecret), nil
	})
	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(*authClaims)
	if !ok || !token.Valid {
		return "", errors.New("invalid token")
	}

	return claims.UserID, nil
}

func normalizeOptional(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}

	lower := strings.ToLower(trimmed)
	return &lower
}
