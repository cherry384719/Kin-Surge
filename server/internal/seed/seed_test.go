package seed_test

import (
	"path/filepath"
	"testing"

	"kin-surge/server/internal/config"
	"kin-surge/server/internal/database"
	"kin-surge/server/internal/models"
)

func TestLoadContentSeedsDynastiesPoemsAndLines(t *testing.T) {
	cfg := config.Config{
		DatabasePath: filepath.Join(t.TempDir(), "seed-test.db"),
		JWTSecret:    "test-secret",
		AppEnv:       "test",
	}

	db, err := database.Open(cfg)
	if err != nil {
		t.Fatalf("open database: %v", err)
	}

	var dynasties int64
	var poems int64
	var lines int64

	if err := db.Model(&models.Dynasty{}).Count(&dynasties).Error; err != nil {
		t.Fatalf("count dynasties: %v", err)
	}
	if err := db.Model(&models.Poem{}).Count(&poems).Error; err != nil {
		t.Fatalf("count poems: %v", err)
	}
	if err := db.Model(&models.PoemLine{}).Count(&lines).Error; err != nil {
		t.Fatalf("count lines: %v", err)
	}

	if dynasties < 6 {
		t.Fatalf("expected at least 6 dynasties, got %d", dynasties)
	}
	if poems < 50 {
		t.Fatalf("expected at least 50 poems, got %d", poems)
	}
	if lines < 150 {
		t.Fatalf("expected at least 150 poem lines, got %d", lines)
	}
}
