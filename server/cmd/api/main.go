package main

import (
	"log"

	"kin-surge/server/internal/config"
	"kin-surge/server/internal/database"
	httpapi "kin-surge/server/internal/http"
)

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg)
	if err != nil {
		log.Fatalf("database init failed: %v", err)
	}

	if err := httpapi.StartServer(db, cfg); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
