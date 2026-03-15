package httpapi

import (
	"net/http"

	"kin-surge/server/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type contentHandler struct {
	db *gorm.DB
}

type dashboardResponse struct {
	User      models.User      `json:"user"`
	Summary   dashboardSummary `json:"summary"`
	Dynasties []dynastyCard    `json:"dynasties"`
}

type dashboardSummary struct {
	CompletedPoets int `json:"completed_poets"`
	TotalPoets     int `json:"total_poets"`
}

type dynastyCard struct {
	ID                uint   `json:"id"`
	Name              string `json:"name"`
	DisplayName       string `json:"display_name"`
	SortOrder         int    `json:"sort_order"`
	UnlockRequirement int    `json:"unlock_requirement"`
	Unlocked          bool   `json:"unlocked"`
	CompletedPoets    int    `json:"completed_poets"`
	TotalPoets        int    `json:"total_poets"`
	BossCompleted     bool   `json:"boss_completed"`
}

type dynastyPageResponse struct {
	User    models.User      `json:"user"`
	Dynasty models.Dynasty   `json:"dynasty"`
	Summary dashboardSummary `json:"summary"`
	Poets   []poetCard       `json:"poets"`
}

type poetCard struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	BioShort  string `json:"bio_short"`
	SortOrder int    `json:"sort_order"`
	IsBoss    bool   `json:"is_boss"`
	Unlocked  bool   `json:"unlocked"`
	Completed bool   `json:"completed"`
	Stars     int    `json:"stars"`
}

func newContentHandler(db *gorm.DB) contentHandler {
	return contentHandler{db: db}
}

func (h contentHandler) dashboard(c *gin.Context) {
	user, _ := currentUser(c)
	dynasties, summary, err := h.loadDashboard(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "加载主页失败"})
		return
	}

	c.JSON(http.StatusOK, dashboardResponse{
		User:      user,
		Summary:   summary,
		Dynasties: dynasties,
	})
}

func (h contentHandler) dynasty(c *gin.Context) {
	user, _ := currentUser(c)
	dynastyID := c.Param("id")
	response, err := h.loadDynastyPage(user.ID, dynastyID, user)
	if err != nil {
		status := http.StatusInternalServerError
		if err == gorm.ErrRecordNotFound {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": "加载朝代失败"})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h contentHandler) loadDashboard(userID string) ([]dynastyCard, dashboardSummary, error) {
	var dynasties []models.Dynasty
	if err := h.db.Order("sort_order").Find(&dynasties).Error; err != nil {
		return nil, dashboardSummary{}, err
	}

	progressMap, err := loadProgressMap(h.db, userID)
	if err != nil {
		return nil, dashboardSummary{}, err
	}

	cards := make([]dynastyCard, 0, len(dynasties))
	totalPoets := 0
	completedPoets := 0
	var previousBossCompleted bool = true

	for index, dynasty := range dynasties {
		var poets []models.Poet
		if err := h.db.Where("dynasty_id = ?", dynasty.ID).Order("sort_order").Find(&poets).Error; err != nil {
			return nil, dashboardSummary{}, err
		}

		regularCount := 0
		regularCompleted := 0
		bossCompleted := false
		for _, poet := range poets {
			progress, exists := progressMap[poet.ID]
			if poet.IsBoss {
				bossCompleted = exists && progress.Completed
				continue
			}
			regularCount++
			if exists && progress.Completed {
				regularCompleted++
			}
		}

		unlocked := index == 0 || previousBossCompleted
		previousBossCompleted = bossCompleted
		totalPoets += regularCount
		completedPoets += regularCompleted
		cards = append(cards, dynastyCard{
			ID:                dynasty.ID,
			Name:              dynasty.Name,
			DisplayName:       dynasty.DisplayName,
			SortOrder:         dynasty.SortOrder,
			UnlockRequirement: dynasty.UnlockRequirement,
			Unlocked:          unlocked,
			CompletedPoets:    regularCompleted,
			TotalPoets:        regularCount,
			BossCompleted:     bossCompleted,
		})
	}

	return cards, dashboardSummary{
		CompletedPoets: completedPoets,
		TotalPoets:     totalPoets,
	}, nil
}

func (h contentHandler) loadDynastyPage(userID string, dynastyID string, user models.User) (dynastyPageResponse, error) {
	var dynasty models.Dynasty
	if err := h.db.First(&dynasty, "id = ?", dynastyID).Error; err != nil {
		return dynastyPageResponse{}, err
	}

	dynasties, summary, err := h.loadDashboard(userID)
	if err != nil {
		return dynastyPageResponse{}, err
	}

	unlockedDynasties := map[uint]bool{}
	for _, item := range dynasties {
		unlockedDynasties[item.ID] = item.Unlocked
	}

	var poets []models.Poet
	if err := h.db.Where("dynasty_id = ?", dynasty.ID).Order("sort_order").Find(&poets).Error; err != nil {
		return dynastyPageResponse{}, err
	}

	progressMap, err := loadProgressMap(h.db, userID)
	if err != nil {
		return dynastyPageResponse{}, err
	}

	allRegularCompleted := true
	for _, poet := range poets {
		if poet.IsBoss {
			continue
		}
		progress := progressMap[poet.ID]
		if !progress.Completed {
			allRegularCompleted = false
			break
		}
	}

	items := make([]poetCard, 0, len(poets))
	previousRegularCompleted := true
	for _, poet := range poets {
		progress := progressMap[poet.ID]
		completed := progress.Completed
		stars := progress.Stars
		unlocked := unlockedDynasties[dynasty.ID]
		if unlocked {
			if poet.IsBoss {
				unlocked = allRegularCompleted
			} else {
				unlocked = previousRegularCompleted
				previousRegularCompleted = completed
			}
		}

		items = append(items, poetCard{
			ID:        poet.ID,
			Name:      poet.Name,
			BioShort:  poet.BioShort,
			SortOrder: poet.SortOrder,
			IsBoss:    poet.IsBoss,
			Unlocked:  unlocked,
			Completed: completed,
			Stars:     stars,
		})
	}

	return dynastyPageResponse{
		User:    user,
		Dynasty: dynasty,
		Summary: summary,
		Poets:   items,
	}, nil
}

func loadProgressMap(db *gorm.DB, userID string) (map[uint]models.PoetProgress, error) {
	var rows []models.PoetProgress
	if err := db.Where("user_id = ?", userID).Find(&rows).Error; err != nil {
		return nil, err
	}

	progressMap := make(map[uint]models.PoetProgress, len(rows))
	for _, row := range rows {
		progressMap[row.PoetID] = row
	}

	return progressMap, nil
}
