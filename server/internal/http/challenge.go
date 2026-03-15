package httpapi

import (
	"errors"
	"math"
	"net/http"

	"kin-surge/server/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type challengeHandler struct {
	db *gorm.DB
}

type challengeResponse struct {
	User    models.User       `json:"user"`
	Dynasty models.Dynasty    `json:"dynasty"`
	Poet    models.Poet       `json:"poet"`
	Poems   []models.Poem     `json:"poems"`
	Lines   []models.PoemLine `json:"lines"`
}

type completeChallengeRequest struct {
	CorrectAnswers int `json:"correct_answers"`
	TotalQuestions int `json:"total_questions"`
	Mistakes       int `json:"mistakes"`
}

type completeChallengeResponse struct {
	Passed          bool        `json:"passed"`
	Stars           int         `json:"stars"`
	CoinsEarned     int         `json:"coins_earned"`
	FirstClearBonus int         `json:"first_clear_bonus"`
	User            models.User `json:"user"`
}

func newChallengeHandler(db *gorm.DB) challengeHandler {
	return challengeHandler{db: db}
}

func (h challengeHandler) getChallenge(c *gin.Context) {
	user, _ := currentUser(c)
	poetID := c.Param("poetId")
	response, err := h.loadChallenge(user.ID, poetID, user)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		}
		if errors.Is(err, errChallengeLocked) {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": "加载挑战失败"})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h challengeHandler) completeChallenge(c *gin.Context) {
	user, _ := currentUser(c)
	poetID := c.Param("poetId")

	var input completeChallengeRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数不正确"})
		return
	}
	if input.TotalQuestions <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "题目数量不正确"})
		return
	}

	poet, err := h.ensurePoetUnlocked(user.ID, poetID)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, errChallengeLocked) {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": "当前诗人尚未解锁"})
		return
	}

	passed := float64(input.CorrectAnswers) >= math.Ceil(float64(input.TotalQuestions)*0.6)
	stars := 0
	if passed {
		stars = calculateStars(input.Mistakes)
	}

	coinsEarned := 0
	firstClearBonus := 0

	err = h.db.Transaction(func(tx *gorm.DB) error {
		var progress models.PoetProgress
		existingErr := tx.Where("user_id = ? AND poet_id = ?", user.ID, poet.ID).First(&progress).Error
		if existingErr != nil && !errors.Is(existingErr, gorm.ErrRecordNotFound) {
			return existingErr
		}

		if passed {
			coinsEarned = input.CorrectAnswers * 10
			if errors.Is(existingErr, gorm.ErrRecordNotFound) || !progress.Completed {
				firstClearBonus = 30
				coinsEarned += firstClearBonus
			}

			next := models.PoetProgress{
				UserID:       user.ID,
				PoetID:       poet.ID,
				Stars:        stars,
				Completed:    true,
				Mistakes:     input.Mistakes,
				CorrectCount: input.CorrectAnswers,
			}

			if errors.Is(existingErr, gorm.ErrRecordNotFound) {
				if err := tx.Create(&next).Error; err != nil {
					return err
				}
			} else {
				if stars > progress.Stars || !progress.Completed {
					progress.Stars = stars
				}
				progress.Completed = true
				if progress.Mistakes == 0 || input.Mistakes < progress.Mistakes {
					progress.Mistakes = input.Mistakes
				}
				if input.CorrectAnswers > progress.CorrectCount {
					progress.CorrectCount = input.CorrectAnswers
				}
				if err := tx.Save(&progress).Error; err != nil {
					return err
				}
			}

			user.Coins += coinsEarned
			if err := tx.Model(&models.User{}).Where("id = ?", user.ID).Update("coins", user.Coins).Error; err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存闯关结果失败"})
		return
	}

	c.JSON(http.StatusOK, completeChallengeResponse{
		Passed:          passed,
		Stars:           stars,
		CoinsEarned:     coinsEarned,
		FirstClearBonus: firstClearBonus,
		User:            user,
	})
}

var errChallengeLocked = errors.New("challenge locked")

func (h challengeHandler) loadChallenge(userID string, poetID string, user models.User) (challengeResponse, error) {
	poet, err := h.ensurePoetUnlocked(userID, poetID)
	if err != nil {
		return challengeResponse{}, err
	}

	var dynasty models.Dynasty
	if err := h.db.First(&dynasty, "id = ?", poet.DynastyID).Error; err != nil {
		return challengeResponse{}, err
	}

	poemQuery := h.db.Where("poet_id = ?", poet.ID)
	if poet.IsBoss {
		var regularPoets []models.Poet
		if err := h.db.Where("dynasty_id = ? AND is_boss = ?", poet.DynastyID, false).Find(&regularPoets).Error; err != nil {
			return challengeResponse{}, err
		}
		poetIDs := make([]uint, 0, len(regularPoets))
		for _, item := range regularPoets {
			poetIDs = append(poetIDs, item.ID)
		}
		poemQuery = h.db.Where("poet_id IN ?", poetIDs)
	}

	var poems []models.Poem
	if err := poemQuery.Order("id").Find(&poems).Error; err != nil {
		return challengeResponse{}, err
	}

	poemIDs := make([]uint, 0, len(poems))
	for _, poem := range poems {
		poemIDs = append(poemIDs, poem.ID)
	}

	var lines []models.PoemLine
	if len(poemIDs) > 0 {
		if err := h.db.Where("poem_id IN ?", poemIDs).Order("poem_id, line_number").Find(&lines).Error; err != nil {
			return challengeResponse{}, err
		}
	}

	return challengeResponse{
		User:    user,
		Dynasty: dynasty,
		Poet:    poet,
		Poems:   poems,
		Lines:   lines,
	}, nil
}

func (h challengeHandler) ensurePoetUnlocked(userID string, poetID string) (models.Poet, error) {
	var poet models.Poet
	if err := h.db.First(&poet, "id = ?", poetID).Error; err != nil {
		return models.Poet{}, err
	}

	page, err := newContentHandler(h.db).loadDynastyPage(userID, intToString(poet.DynastyID), models.User{})
	if err != nil {
		return models.Poet{}, err
	}

	for _, item := range page.Poets {
		if item.ID == poet.ID && item.Unlocked {
			return poet, nil
		}
	}

	return models.Poet{}, errChallengeLocked
}

func calculateStars(mistakes int) int {
	if mistakes <= 0 {
		return 3
	}
	if mistakes <= 2 {
		return 2
	}
	return 1
}
