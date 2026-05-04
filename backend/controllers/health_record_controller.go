package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"personHealthManage/database"
	"personHealthManage/models"
)

type CreateHealthRecordRequest struct {
	Height            float64 `json:"height"`
	Weight            float64 `json:"weight"`
	BloodPressureHigh int     `json:"blood_pressure_high"`
	BloodPressureLow  int     `json:"blood_pressure_low"`
	HeartRate         int     `json:"heart_rate"`
	BodyFat           float64 `json:"body_fat"`
	MuscleMass        float64 `json:"muscle_mass"`
	BoneDensity       float64 `json:"bone_density"`
	WaterRate         float64 `json:"water_rate"`
	MetabolicRate     int     `json:"metabolic_rate"`
	Notes             string  `json:"notes"`
}

type UpdateHealthRecordRequest struct {
	Height            float64 `json:"height"`
	Weight            float64 `json:"weight"`
	BloodPressureHigh int     `json:"blood_pressure_high"`
	BloodPressureLow  int     `json:"blood_pressure_low"`
	HeartRate         int     `json:"heart_rate"`
	BodyFat           float64 `json:"body_fat"`
	MuscleMass        float64 `json:"muscle_mass"`
	BoneDensity       float64 `json:"bone_density"`
	WaterRate         float64 `json:"water_rate"`
	MetabolicRate     int     `json:"metabolic_rate"`
	Notes             string  `json:"notes"`
}

func GetMyHealthRecords(c *gin.Context) {
	userID, _ := c.Get("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	database.DB.Model(&models.HealthRecord{}).Where("user_id = ?", userID).Count(&total)

	var records []models.HealthRecord
	offset := (page - 1) * pageSize
	if err := database.DB.Where("user_id = ?", userID).Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取健康记录失败",
		})
		return
	}

	var recordList []gin.H
	for _, r := range records {
		recordList = append(recordList, gin.H{
			"id":                  r.ID,
			"height":              r.Height,
			"weight":              r.Weight,
			"bmi":                 r.BMI,
			"blood_pressure_high": r.BloodPressureHigh,
			"blood_pressure_low":  r.BloodPressureLow,
			"heart_rate":          r.HeartRate,
			"body_fat":            r.BodyFat,
			"muscle_mass":         r.MuscleMass,
			"bone_density":        r.BoneDensity,
			"water_rate":          r.WaterRate,
			"metabolic_rate":      r.MetabolicRate,
			"notes":               r.Notes,
			"created_at":          r.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      recordList,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetHealthRecords(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	userIDStr := c.Query("user_id")

	var total int64
	query := database.DB.Model(&models.HealthRecord{})

	if userIDStr != "" {
		query = query.Where("user_id = ?", userIDStr)
	}

	query.Count(&total)

	var records []models.HealthRecord
	offset := (page - 1) * pageSize
	if err := query.Preload("User").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取健康记录失败",
		})
		return
	}

	var recordList []gin.H
	for _, r := range records {
		recordList = append(recordList, gin.H{
			"id":                  r.ID,
			"user_id":             r.UserID,
			"username":            r.User.Username,
			"height":              r.Height,
			"weight":              r.Weight,
			"bmi":                 r.BMI,
			"blood_pressure_high": r.BloodPressureHigh,
			"blood_pressure_low":  r.BloodPressureLow,
			"heart_rate":          r.HeartRate,
			"body_fat":            r.BodyFat,
			"muscle_mass":         r.MuscleMass,
			"bone_density":        r.BoneDensity,
			"water_rate":          r.WaterRate,
			"metabolic_rate":      r.MetabolicRate,
			"notes":               r.Notes,
			"created_at":          r.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      recordList,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetHealthRecordByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的记录ID",
		})
		return
	}

	var record models.HealthRecord
	if err := database.DB.Preload("User").First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "健康记录不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"id":                  record.ID,
			"user_id":             record.UserID,
			"username":            record.User.Username,
			"height":              record.Height,
			"weight":              record.Weight,
			"bmi":                 record.BMI,
			"blood_pressure_high": record.BloodPressureHigh,
			"blood_pressure_low":  record.BloodPressureLow,
			"heart_rate":          record.HeartRate,
			"body_fat":            record.BodyFat,
			"muscle_mass":         record.MuscleMass,
			"bone_density":        record.BoneDensity,
			"water_rate":          record.WaterRate,
			"metabolic_rate":      record.MetabolicRate,
			"notes":               record.Notes,
			"created_at":          record.CreatedAt,
		},
	})
}

func CreateHealthRecord(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateHealthRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	record := models.HealthRecord{
		UserID:            userID.(uint),
		Height:            req.Height,
		Weight:            req.Weight,
		BloodPressureHigh: req.BloodPressureHigh,
		BloodPressureLow:  req.BloodPressureLow,
		HeartRate:         req.HeartRate,
		BodyFat:           req.BodyFat,
		MuscleMass:        req.MuscleMass,
		BoneDensity:       req.BoneDensity,
		WaterRate:         req.WaterRate,
		MetabolicRate:     req.MetabolicRate,
		Notes:             req.Notes,
	}

	record.CalculateBMI()

	if err := database.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建健康记录失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "创建成功",
		"data": gin.H{
			"id": record.ID,
		},
	})
}

func UpdateHealthRecord(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的记录ID",
		})
		return
	}

	var req UpdateHealthRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	var record models.HealthRecord
	if err := database.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "健康记录不存在",
		})
		return
	}

	updates := make(map[string]interface{})
	if req.Height > 0 {
		updates["height"] = req.Height
	}
	if req.Weight > 0 {
		updates["weight"] = req.Weight
	}
	if req.BloodPressureHigh > 0 {
		updates["blood_pressure_high"] = req.BloodPressureHigh
	}
	if req.BloodPressureLow > 0 {
		updates["blood_pressure_low"] = req.BloodPressureLow
	}
	if req.HeartRate > 0 {
		updates["heart_rate"] = req.HeartRate
	}
	if req.BodyFat > 0 {
		updates["body_fat"] = req.BodyFat
	}
	if req.MuscleMass > 0 {
		updates["muscle_mass"] = req.MuscleMass
	}
	if req.BoneDensity > 0 {
		updates["bone_density"] = req.BoneDensity
	}
	if req.WaterRate > 0 {
		updates["water_rate"] = req.WaterRate
	}
	if req.MetabolicRate > 0 {
		updates["metabolic_rate"] = req.MetabolicRate
	}
	if req.Notes != "" {
		updates["notes"] = req.Notes
	}

	if err := database.DB.Model(&record).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新失败",
		})
		return
	}

	if req.Height > 0 && req.Weight > 0 {
		bmi := req.Weight / ((req.Height / 100) * (req.Height / 100))
		database.DB.Model(&record).Update("bmi", bmi)
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
	})
}

func DeleteHealthRecord(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的记录ID",
		})
		return
	}

	database.DB.Where("record_id = ?", id).Delete(&models.HealthEvaluation{})

	if err := database.DB.Delete(&models.HealthRecord{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "删除失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "删除成功",
	})
}

func GetHealthStats(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var records []models.HealthRecord
	if err := database.DB.Where("user_id = ?", userID).Order("created_at ASC").Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取健康数据失败",
		})
		return
	}

	var weightTrend []gin.H
	var bmiTrend []gin.H
	var bloodPressureTrend []gin.H
	var heartRateTrend []gin.H

	for _, r := range records {
		date := r.CreatedAt.Format("2006-01-02")
		if r.Weight > 0 {
			weightTrend = append(weightTrend, gin.H{
				"date":  date,
				"value": r.Weight,
			})
		}
		if r.BMI > 0 {
			bmiTrend = append(bmiTrend, gin.H{
				"date":  date,
				"value": r.BMI,
			})
		}
		if r.BloodPressureHigh > 0 {
			bloodPressureTrend = append(bloodPressureTrend, gin.H{
				"date":   date,
				"high":   r.BloodPressureHigh,
				"low":    r.BloodPressureLow,
			})
		}
		if r.HeartRate > 0 {
			heartRateTrend = append(heartRateTrend, gin.H{
				"date":  date,
				"value": r.HeartRate,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"weight_trend":        weightTrend,
			"bmi_trend":           bmiTrend,
			"blood_pressure_trend": bloodPressureTrend,
			"heart_rate_trend":    heartRateTrend,
		},
	})
}
