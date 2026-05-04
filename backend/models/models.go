package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Role struct {
	BaseModel
	Name        string `json:"name" gorm:"type:varchar(50);uniqueIndex;not null"`
	Description string `json:"description"`
	Users       []User `json:"-" gorm:"foreignKey:RoleID"`
}

type User struct {
	BaseModel
	Username     string       `json:"username" gorm:"type:varchar(50);uniqueIndex;not null"`
	Password     string       `json:"-" gorm:"not null"`
	Email        string       `json:"email"`
	Phone        string       `json:"phone"`
	RealName     string       `json:"real_name"`
	Age          int          `json:"age"`
	Gender       string       `json:"gender"`
	RoleID       uint         `json:"role_id"`
	Role         Role         `json:"role" gorm:"foreignKey:RoleID"`
	HealthRecords []HealthRecord `json:"-" gorm:"foreignKey:UserID"`
	Evaluations  []HealthEvaluation `json:"-" gorm:"foreignKey:UserID"`
}

type SportKnowledge struct {
	BaseModel
	Title       string  `json:"title" gorm:"not null"`
	Description string  `json:"description"`
	Content     string  `json:"content" gorm:"type:text"`
	Category    string  `json:"category"`
	ImageURL    string  `json:"image_url"`
	Views       int     `json:"views" gorm:"default:0"`
	SportDetails []SportDetail `json:"sport_details" gorm:"foreignKey:KnowledgeID"`
}

type SportDetail struct {
	BaseModel
	KnowledgeID uint         `json:"knowledge_id"`
	Title       string       `json:"title" gorm:"not null"`
	Description string       `json:"description"`
	Content     string       `json:"content" gorm:"type:text"`
	Duration    int          `json:"duration"`
	Calories    int          `json:"calories"`
	Level       string       `json:"level"`
	ImageURL    string       `json:"image_url"`
	Knowledge   SportKnowledge `json:"-" gorm:"foreignKey:KnowledgeID"`
}

type HealthRecord struct {
	BaseModel
	UserID       uint    `json:"user_id"`
	Height       float64 `json:"height"`
	Weight       float64 `json:"weight"`
	BMI          float64 `json:"bmi"`
	BloodPressureHigh int `json:"blood_pressure_high"`
	BloodPressureLow  int `json:"blood_pressure_low"`
	HeartRate    int     `json:"heart_rate"`
	BodyFat      float64 `json:"body_fat"`
	MuscleMass   float64 `json:"muscle_mass"`
	BoneDensity  float64 `json:"bone_density"`
	WaterRate    float64 `json:"water_rate"`
	MetabolicRate int    `json:"metabolic_rate"`
	Notes        string  `json:"notes"`
	User         User    `json:"-" gorm:"foreignKey:UserID"`
}

type HealthEvaluation struct {
	BaseModel
	UserID        uint    `json:"user_id"`
	RecordID      uint    `json:"record_id"`
	OverallScore  float64 `json:"overall_score"`
	BMIStatus     string  `json:"bmi_status"`
	WeightStatus  string  `json:"weight_status"`
	BloodPressureStatus string `json:"blood_pressure_status"`
	HeartRateStatus string `json:"heart_rate_status"`
	BodyFatStatus string  `json:"body_fat_status"`
	Suggestions   string  `json:"suggestions" gorm:"type:text"`
	User          User    `json:"-" gorm:"foreignKey:UserID"`
	HealthRecord  HealthRecord `json:"-" gorm:"foreignKey:RecordID"`
}

func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

func (h *HealthRecord) CalculateBMI() {
	if h.Height > 0 && h.Weight > 0 {
		h.BMI = h.Weight / ((h.Height / 100) * (h.Height / 100))
	}
}
