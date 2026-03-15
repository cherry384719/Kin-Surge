package httpapi

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"kin-surge/server/internal/config"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewRouter(db *gorm.DB, cfg config.Config) *gin.Engine {
	gin.SetMode(cfg.GinMode)
	router := gin.Default()
	if err := router.SetTrustedProxies(cfg.TrustedProxies); err != nil {
		panic(fmt.Errorf("set trusted proxies: %w", err))
	}
	router.Use(corsMiddleware(cfg))

	auth := newAuthHandler(db, cfg)
	content := newContentHandler(db)
	challenge := newChallengeHandler(db)

	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	router.POST("/api/auth/register", auth.register)
	router.POST("/api/auth/login", auth.login)
	router.POST("/api/auth/guest", auth.guest)

	protected := router.Group("/api")
	protected.Use(auth.authMiddleware())
	protected.POST("/auth/logout", auth.logout)
	protected.GET("/auth/me", auth.me)
	protected.GET("/dashboard", content.dashboard)
	protected.GET("/dynasties/:id", content.dynasty)
	protected.GET("/challenges/poets/:poetId", challenge.getChallenge)
	protected.POST("/challenges/poets/:poetId/complete", challenge.completeChallenge)

	registerStatic(router, cfg)
	return router
}

func registerStatic(router *gin.Engine, cfg config.Config) {
	indexPath := filepath.Join(cfg.DistDir, "index.html")
	if _, err := os.Stat(indexPath); err != nil {
		return
	}

	router.Static("/assets", filepath.Join(cfg.DistDir, "assets"))
	router.StaticFile("/favicon.ico", filepath.Join(cfg.DistDir, "favicon.ico"))
	router.NoRoute(func(c *gin.Context) {
		if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/api" {
			c.JSON(http.StatusNotFound, gin.H{"error": "接口不存在"})
			return
		}
		c.File(indexPath)
	})
}

func corsMiddleware(cfg config.Config) gin.HandlerFunc {
	allowedOrigins := make(map[string]struct{}, len(cfg.AllowOrigins))
	for _, origin := range cfg.AllowOrigins {
		allowedOrigins[origin] = struct{}{}
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if _, ok := allowedOrigins[origin]; ok {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Headers", "Content-Type")
			c.Header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func intToString(value uint) string {
	return strconv.Itoa(int(value))
}

func StartServer(db *gorm.DB, cfg config.Config) error {
	router := NewRouter(db, cfg)
	return router.Run(fmt.Sprintf(":%s", cfg.Port))
}
