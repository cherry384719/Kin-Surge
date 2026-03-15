package database

import (
	"fmt"
	"os"
	"path/filepath"

	"kin-surge/server/internal/config"
	"kin-surge/server/internal/models"
	"kin-surge/server/internal/seed"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Open(cfg config.Config) (*gorm.DB, error) {
	if err := os.MkdirAll(filepath.Dir(cfg.DatabasePath), 0o755); err != nil {
		return nil, fmt.Errorf("create db dir: %w", err)
	}

	db, err := gorm.Open(sqlite.Open(cfg.DatabasePath), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}

	if err := migrate(db); err != nil {
		return nil, err
	}

	if err := seed.LoadContent(db); err != nil {
		return nil, err
	}

	return db, nil
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Dynasty{},
		&models.Poet{},
		&models.Poem{},
		&models.PoemLine{},
		&models.PoetProgress{},
	)
}
