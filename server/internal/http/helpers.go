package httpapi

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
)

func newID() string {
	buffer := make([]byte, 16)
	if _, err := rand.Read(buffer); err != nil {
		return hex.EncodeToString([]byte(strings.ReplaceAll("kin-surge-user", "-", "")))
	}

	return hex.EncodeToString(buffer)
}

func sanitizeHandle(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	replacer := strings.NewReplacer(" ", "_", "-", "_")
	value = replacer.Replace(value)

	builder := strings.Builder{}
	for _, char := range value {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '_' {
			builder.WriteRune(char)
		}
	}

	return builder.String()
}
