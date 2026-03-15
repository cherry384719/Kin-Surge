package config

import (
	"os"
	"strings"
)

type Config struct {
	Port           string
	DatabasePath   string
	JWTSecret      string
	AppEnv         string
	GinMode        string
	AllowOrigins   []string
	TrustedProxies []string
	DistDir        string
}

func Load() Config {
	return Config{
		Port:           getEnv("KIN_PORT", "8080"),
		DatabasePath:   getEnv("KIN_DB_PATH", "./data/kinsurge.db"),
		JWTSecret:      getEnv("KIN_JWT_SECRET", "kin-surge-dev-secret"),
		AppEnv:         getEnv("KIN_APP_ENV", "development"),
		GinMode:        getEnv("GIN_MODE", "debug"),
		AllowOrigins:   splitList(getEnv("KIN_ALLOW_ORIGINS", "http://localhost:5173,http://localhost:4173")),
		TrustedProxies: splitList(getEnv("KIN_TRUSTED_PROXIES", "127.0.0.1,::1,172.16.0.0/12,10.0.0.0/8,192.168.0.0/16")),
		DistDir:        getEnv("KIN_DIST_DIR", "../dist"),
	}
}

func (c Config) IsProduction() bool {
	return strings.EqualFold(c.AppEnv, "production")
}

func getEnv(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	return value
}

func splitList(value string) []string {
	parts := strings.Split(value, ",")
	items := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			items = append(items, trimmed)
		}
	}

	return items
}
