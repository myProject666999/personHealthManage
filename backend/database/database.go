package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"personHealthManage/config"
	"personHealthManage/models"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.DBName,
	)

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Info,
			Colorful:      true,
		},
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	err = DB.AutoMigrate(
		&models.Role{},
		&models.User{},
		&models.SportKnowledge{},
		&models.SportDetail{},
		&models.HealthRecord{},
		&models.HealthEvaluation{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migrated successfully")

	initSeedData()
}

func initSeedData() {
	var roleCount int64
	DB.Model(&models.Role{}).Count(&roleCount)
	if roleCount > 0 {
		return
	}

	roles := []models.Role{
		{Name: "user", Description: "普通用户"},
		{Name: "admin", Description: "管理员"},
	}

	for i := range roles {
		if err := DB.Create(&roles[i]).Error; err != nil {
			log.Printf("Failed to create role: %v", err)
		}
	}

	var adminRole models.Role
	DB.Where("name = ?", "admin").First(&adminRole)

	var userRole models.Role
	DB.Where("name = ?", "user").First(&userRole)

	adminUser := models.User{
		Username: "admin",
		RoleID:   adminRole.ID,
		RealName: "管理员",
		Email:    "admin@example.com",
	}
	adminUser.SetPassword("admin123")
	if err := DB.Create(&adminUser).Error; err != nil {
		log.Printf("Failed to create admin user: %v", err)
	}

	testUser := models.User{
		Username: "user",
		RoleID:   userRole.ID,
		RealName: "测试用户",
		Email:    "user@example.com",
		Age:      25,
		Gender:   "男",
	}
	testUser.SetPassword("user123")
	if err := DB.Create(&testUser).Error; err != nil {
		log.Printf("Failed to create test user: %v", err)
	}

	sportKnowledges := []models.SportKnowledge{
		{
			Title:       "有氧运动入门指南",
			Description: "了解有氧运动的基本知识和入门技巧",
			Content:     "有氧运动是指人体在氧气充分供应的情况下进行的体育锻炼。即在运动过程中，人体吸入的氧气与需求相等，达到生理上的平衡状态。简单来说，有氧运动是指强度低且富韵律性的运动，其运动时间较长（约30分钟或以上），运动强度在中等或中上的程度(最大心率值的60%至80%)。",
			Category:    "有氧运动",
			Views:       100,
		},
		{
			Title:       "力量训练基础",
			Description: "学习力量训练的基本方法和技巧",
			Content:     "力量训练是通过多次多组有节奏的负重练习达到改善肌肉群力量、耐力和形状的运动方式。不同的次数、组数以及负重都会产生不同的效果。一般来说，每组重复8-12次可以有效增肌，15次以上主要锻炼肌肉耐力。",
			Category:    "力量训练",
			Views:       80,
		},
		{
			Title:       "柔韧性训练方法",
			Description: "提高身体柔韧性的训练方法",
			Content:     "柔韧性训练是指让身体关节在一定范围内活动的能力，同时也指肌肉、韧带、肌腱等软组织的伸展能力。良好的柔韧性可以减少运动损伤，提高运动表现，改善身体姿势。常见的柔韧性训练方法包括静态拉伸、动态拉伸、PNF拉伸等。",
			Category:    "柔韧性",
			Views:       60,
		},
	}

	for i := range sportKnowledges {
		if err := DB.Create(&sportKnowledges[i]).Error; err != nil {
			log.Printf("Failed to create sport knowledge: %v", err)
		}
	}

	var aerobicKnowledge models.SportKnowledge
	DB.Where("title = ?", "有氧运动入门指南").First(&aerobicKnowledge)

	sportDetails := []models.SportDetail{
		{
			KnowledgeID: aerobicKnowledge.ID,
			Title:       "快速步行",
			Description: "简单有效的有氧运动方式",
			Content:     "快速步行是一种低冲击的有氧运动，适合各个年龄段的人群。保持每分钟100-120步的节奏，每次30-45分钟，可以有效提高心肺功能，燃烧脂肪。",
			Duration:    30,
			Calories:    200,
			Level:       "初级",
		},
		{
			KnowledgeID: aerobicKnowledge.ID,
			Title:       "慢跑",
			Description: "经典的有氧运动",
			Content:     "慢跑是最常见的有氧运动之一。保持舒适的速度，可以边跑边交谈的强度为宜。每次20-30分钟，每周3-4次，可以显著提高心肺耐力和减脂效果。",
			Duration:    30,
			Calories:    350,
			Level:       "中级",
		},
		{
			KnowledgeID: aerobicKnowledge.ID,
			Title:       "游泳",
			Description: "全身锻炼的有氧运动",
			Content:     "游泳是一种全身性的有氧运动，对关节的压力很小。游泳可以锻炼全身肌肉，提高心肺功能。每次30-45分钟的游泳训练，是非常好的全身锻炼方式。",
			Duration:    45,
			Calories:    400,
			Level:       "中级",
		},
	}

	for i := range sportDetails {
		if err := DB.Create(&sportDetails[i]).Error; err != nil {
			log.Printf("Failed to create sport detail: %v", err)
		}
	}

	log.Println("Seed data initialized successfully")
}
