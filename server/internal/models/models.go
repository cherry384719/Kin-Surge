package models

import "time"

type User struct {
	ID           string    `gorm:"primaryKey;size:36" json:"id"`
	Username     string    `gorm:"size:64;uniqueIndex;not null" json:"username"`
	Email        *string   `gorm:"size:160;uniqueIndex" json:"email"`
	PasswordHash string    `gorm:"size:255" json:"-"`
	DisplayName  string    `gorm:"size:80;not null" json:"display_name"`
	Coins        int       `gorm:"not null;default:0" json:"coins"`
	IsGuest      bool      `gorm:"not null;default:false" json:"is_guest"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Dynasty struct {
	ID                uint   `gorm:"primaryKey;autoIncrement:false" json:"id"`
	Name              string `gorm:"size:32;uniqueIndex;not null" json:"name"`
	DisplayName       string `gorm:"size:32;not null" json:"display_name"`
	SortOrder         int    `gorm:"not null" json:"sort_order"`
	UnlockRequirement int    `gorm:"not null;default:0" json:"unlock_requirement"`
}

type Poet struct {
	ID             uint   `gorm:"primaryKey;autoIncrement:false" json:"id"`
	DynastyID      uint   `gorm:"index;not null" json:"dynasty_id"`
	Name           string `gorm:"size:64;not null" json:"name"`
	BioShort       string `gorm:"type:text" json:"bio_short"`
	AvatarURL      string `gorm:"size:255" json:"avatar_url"`
	SortOrder      int    `gorm:"not null;default:0" json:"sort_order"`
	IsBoss         bool   `gorm:"not null;default:false" json:"is_boss"`
	ChallengeIntro string `gorm:"type:text;default:''" json:"challenge_intro"`
}

type Poem struct {
	ID              uint   `gorm:"primaryKey;autoIncrement:false" json:"id"`
	PoetID          uint   `gorm:"index;not null" json:"poet_id"`
	DynastyID       uint   `gorm:"index;not null" json:"dynasty_id"`
	Title           string `gorm:"size:128;not null" json:"title"`
	FullText        string `gorm:"type:text;not null" json:"full_text"`
	CurriculumGrade string `gorm:"size:32" json:"curriculum_grade"`
}

type PoemLine struct {
	ID         uint   `gorm:"primaryKey;autoIncrement:false" json:"id"`
	PoemID     uint   `gorm:"index;not null" json:"poem_id"`
	LineNumber int    `gorm:"not null" json:"line_number"`
	Text       string `gorm:"type:text;not null" json:"text"`
}

type PoetProgress struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       string    `gorm:"size:36;not null;uniqueIndex:idx_user_poet" json:"user_id"`
	PoetID       uint      `gorm:"not null;uniqueIndex:idx_user_poet" json:"poet_id"`
	Stars        int       `gorm:"not null;default:0" json:"stars"`
	Completed    bool      `gorm:"not null;default:false" json:"completed"`
	Mistakes     int       `gorm:"not null;default:0" json:"mistakes"`
	CorrectCount int       `gorm:"not null;default:0" json:"correct_count"`
	UpdatedAt    time.Time `json:"updated_at"`
	CreatedAt    time.Time `json:"created_at"`
}
