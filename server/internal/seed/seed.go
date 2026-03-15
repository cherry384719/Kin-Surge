package seed

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"unicode/utf8"

	"kin-surge/server/internal/models"

	"gorm.io/gorm"
)

const (
	expandedSeedPath = "../supabase/migrations/004_expanded_seed_data.sql"
	introSeedPath    = "../supabase/migrations/006_challenge_intro.sql"
	morePoemsPath    = "../supabase/migrations/007_more_poems.sql"
)

func LoadContent(db *gorm.DB) error {
	var dynastyCount int64
	if err := db.Model(&models.Dynasty{}).Count(&dynastyCount).Error; err != nil {
		return fmt.Errorf("count dynasties: %w", err)
	}
	if dynastyCount > 0 {
		return ensurePoemLines(db)
	}

	if err := runStatements(db, expandedSeedPath, shouldRunExpanded); err != nil {
		return err
	}
	if err := runStatements(db, introSeedPath, shouldRunIntro); err != nil {
		return err
	}
	if err := runStatements(db, morePoemsPath, shouldRunMorePoems); err != nil {
		return err
	}

	return ensurePoemLines(db)
}

func runStatements(db *gorm.DB, relativePath string, allow func(string) bool) error {
	statements, err := readStatements(relativePath)
	if err != nil {
		return err
	}

	for _, statement := range statements {
		normalized := normalizeStatement(statement)
		if normalized == "" || !allow(normalized) {
			continue
		}
		if err := db.Exec(normalized).Error; err != nil {
			return fmt.Errorf("exec %s: %w", relativePath, err)
		}
	}

	return nil
}

func readStatements(relativePath string) ([]string, error) {
	absPath, err := resolveRepoPath(relativePath)
	if err != nil {
		return nil, err
	}

	bytes, err := os.ReadFile(absPath)
	if err != nil {
		return nil, fmt.Errorf("read seed %s: %w", absPath, err)
	}

	return strings.Split(string(bytes), ";"), nil
}

func resolveRepoPath(relativePath string) (string, error) {
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		return "", errors.New("runtime caller unavailable")
	}

	seedDir := filepath.Dir(currentFile)
	repoRoot := filepath.Clean(filepath.Join(seedDir, "..", "..", ".."))
	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("getwd: %w", err)
	}

	candidates := []string{
		filepath.Join(repoRoot, strings.TrimPrefix(relativePath, "../")),
		filepath.Join(wd, relativePath),
		filepath.Join(wd, "..", relativePath),
	}

	for _, candidate := range candidates {
		cleaned := filepath.Clean(candidate)
		if _, err := os.Stat(cleaned); err == nil {
			return cleaned, nil
		}
	}

	return "", errors.New("seed file not found")
}

func normalizeStatement(statement string) string {
	lines := strings.Split(statement, "\n")
	filtered := make([]string, 0, len(lines))
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "--") {
			continue
		}
		filtered = append(filtered, line)
	}

	return strings.TrimSpace(strings.Join(filtered, "\n"))
}

func shouldRunExpanded(statement string) bool {
	return strings.HasPrefix(statement, "DELETE FROM poem_lines") ||
		strings.HasPrefix(statement, "DELETE FROM poems") ||
		strings.HasPrefix(statement, "DELETE FROM poets") ||
		strings.HasPrefix(statement, "DELETE FROM dynasties") ||
		strings.HasPrefix(statement, "INSERT INTO dynasties") ||
		strings.HasPrefix(statement, "INSERT INTO poets") ||
		strings.HasPrefix(statement, "INSERT INTO poems") ||
		strings.HasPrefix(statement, "INSERT INTO poem_lines")
}

func shouldRunIntro(statement string) bool {
	return strings.HasPrefix(statement, "UPDATE poets SET challenge_intro")
}

func shouldRunMorePoems(statement string) bool {
	return strings.HasPrefix(statement, "INSERT INTO poems")
}

var splitPunctuation = regexp.MustCompile(`[，。！？；、]`)

func ensurePoemLines(db *gorm.DB) error {
	var poems []models.Poem
	if err := db.Order("id").Find(&poems).Error; err != nil {
		return fmt.Errorf("load poems: %w", err)
	}

	var maxLineID uint
	if err := db.Model(&models.PoemLine{}).Select("COALESCE(MAX(id), 0)").Scan(&maxLineID).Error; err != nil {
		return fmt.Errorf("max poem line id: %w", err)
	}

	for _, poem := range poems {
		var count int64
		if err := db.Model(&models.PoemLine{}).Where("poem_id = ?", poem.ID).Count(&count).Error; err != nil {
			return fmt.Errorf("count poem lines for poem %d: %w", poem.ID, err)
		}
		if count > 0 {
			continue
		}

		lines := splitPoemLines(poem.FullText)
		if len(lines) < 2 {
			continue
		}

		for index, line := range lines {
			maxLineID++
			record := models.PoemLine{
				ID:         maxLineID,
				PoemID:     poem.ID,
				LineNumber: index + 1,
				Text:       line,
			}
			if err := db.Create(&record).Error; err != nil {
				return fmt.Errorf("create poem line for poem %d: %w", poem.ID, err)
			}
		}
	}

	return nil
}

func splitPoemLines(fullText string) []string {
	segments := splitPunctuation.Split(fullText, -1)
	lines := make([]string, 0, len(segments))
	for _, segment := range segments {
		cleaned := strings.TrimSpace(segment)
		if cleaned == "" {
			continue
		}
		if utf8.RuneCountInString(cleaned) < 2 {
			continue
		}
		lines = append(lines, cleaned)
	}

	return lines
}
