package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"personHealthManage/database"
	"personHealthManage/models"
)

func EvaluateHealth(c *gin.Context) {
	userID, _ := c.Get("user_id")
	recordIDStr := c.Query("record_id")

	if recordIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "缺少记录ID参数",
		})
		return
	}

	recordID, err := strconv.ParseUint(recordIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的记录ID",
		})
		return
	}

	var record models.HealthRecord
	if err := database.DB.First(&record, recordID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "健康记录不存在",
		})
		return
	}

	if record.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"code":    403,
			"message": "无权访问此记录",
		})
		return
	}

	evaluation := evaluate(record)
	evaluation.UserID = userID.(uint)
	evaluation.RecordID = uint(recordID)

	if err := database.DB.Create(&evaluation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "保存评估结果失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"id":                   evaluation.ID,
			"overall_score":        evaluation.OverallScore,
			"bmi_status":           evaluation.BMIStatus,
			"weight_status":        evaluation.WeightStatus,
			"blood_pressure_status": evaluation.BloodPressureStatus,
			"heart_rate_status":    evaluation.HeartRateStatus,
			"body_fat_status":      evaluation.BodyFatStatus,
			"suggestions":          evaluation.Suggestions,
		},
	})
}

func GetMyEvaluations(c *gin.Context) {
	userID, _ := c.Get("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	database.DB.Model(&models.HealthEvaluation{}).Where("user_id = ?", userID).Count(&total)

	var evaluations []models.HealthEvaluation
	offset := (page - 1) * pageSize
	if err := database.DB.Where("user_id = ?", userID).Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&evaluations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取评估记录失败",
		})
		return
	}

	var evalList []gin.H
	for _, e := range evaluations {
		evalList = append(evalList, gin.H{
			"id":                    e.ID,
			"record_id":             e.RecordID,
			"overall_score":         e.OverallScore,
			"bmi_status":            e.BMIStatus,
			"weight_status":         e.WeightStatus,
			"blood_pressure_status": e.BloodPressureStatus,
			"heart_rate_status":     e.HeartRateStatus,
			"body_fat_status":       e.BodyFatStatus,
			"suggestions":           e.Suggestions,
			"created_at":            e.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      evalList,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetEvaluations(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	userIDStr := c.Query("user_id")

	var total int64
	query := database.DB.Model(&models.HealthEvaluation{})

	if userIDStr != "" {
		query = query.Where("user_id = ?", userIDStr)
	}

	query.Count(&total)

	var evaluations []models.HealthEvaluation
	offset := (page - 1) * pageSize
	if err := query.Preload("User").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&evaluations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取评估记录失败",
		})
		return
	}

	var evalList []gin.H
	for _, e := range evaluations {
		evalList = append(evalList, gin.H{
			"id":                    e.ID,
			"user_id":               e.UserID,
			"username":              e.User.Username,
			"record_id":             e.RecordID,
			"overall_score":         e.OverallScore,
			"bmi_status":            e.BMIStatus,
			"weight_status":         e.WeightStatus,
			"blood_pressure_status": e.BloodPressureStatus,
			"heart_rate_status":     e.HeartRateStatus,
			"body_fat_status":       e.BodyFatStatus,
			"suggestions":           e.Suggestions,
			"created_at":            e.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      evalList,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func evaluate(record models.HealthRecord) models.HealthEvaluation {
	eval := models.HealthEvaluation{}
	var totalScore float64 = 0
	var scoreCount float64 = 0
	var suggestions []string

	if record.BMI > 0 {
		if record.BMI < 18.5 {
			eval.BMIStatus = "偏瘦"
			eval.WeightStatus = "体重过轻"
			totalScore += 60
			suggestions = append(suggestions, "您的BMI偏低，建议适当增加营养摄入，进行适量的力量训练增加肌肉量。")
		} else if record.BMI >= 18.5 && record.BMI < 24 {
			eval.BMIStatus = "正常"
			eval.WeightStatus = "体重正常"
			totalScore += 90
			suggestions = append(suggestions, "您的BMI在正常范围内，继续保持健康的生活方式。")
		} else if record.BMI >= 24 && record.BMI < 28 {
			eval.BMIStatus = "偏胖"
			eval.WeightStatus = "体重超重"
			totalScore += 70
			suggestions = append(suggestions, "您的BMI偏高，建议控制饮食，增加有氧运动，如慢跑、游泳等。")
		} else {
			eval.BMIStatus = "肥胖"
			eval.WeightStatus = "肥胖"
			totalScore += 50
			suggestions = append(suggestions, "您的BMI过高，建议在医生指导下进行健康减重计划。")
		}
		scoreCount++
	} else {
		eval.BMIStatus = "未检测"
		eval.WeightStatus = "未检测"
	}

	if record.BloodPressureHigh > 0 && record.BloodPressureLow > 0 {
		if record.BloodPressureHigh < 90 || record.BloodPressureLow < 60 {
			eval.BloodPressureStatus = "低血压"
			totalScore += 65
			suggestions = append(suggestions, "您的血压偏低，建议适当增加盐分摄入，避免突然站起，定期监测血压。")
		} else if record.BloodPressureHigh < 120 && record.BloodPressureLow < 80 {
			eval.BloodPressureStatus = "正常"
			totalScore += 95
			suggestions = append(suggestions, "您的血压在正常范围内，继续保持健康的生活方式。")
		} else if record.BloodPressureHigh < 140 && record.BloodPressureLow < 90 {
			eval.BloodPressureStatus = "偏高"
			totalScore += 75
			suggestions = append(suggestions, "您的血压偏高，建议减少盐分摄入，控制体重，适量运动。")
		} else {
			eval.BloodPressureStatus = "高血压"
			totalScore += 55
			suggestions = append(suggestions, "您的血压过高，建议及时就医，遵医嘱进行治疗和管理。")
		}
		scoreCount++
	} else {
		eval.BloodPressureStatus = "未检测"
	}

	if record.HeartRate > 0 {
		if record.HeartRate < 60 {
			eval.HeartRateStatus = "偏慢"
			totalScore += 70
			suggestions = append(suggestions, "您的心率偏慢，如果经常感到头晕或乏力，建议就医检查。")
		} else if record.HeartRate >= 60 && record.HeartRate <= 100 {
			eval.HeartRateStatus = "正常"
			totalScore += 95
			suggestions = append(suggestions, "您的心率在正常范围内。")
		} else {
			eval.HeartRateStatus = "偏快"
			totalScore += 70
			suggestions = append(suggestions, "您的心率偏快，建议减少咖啡因摄入，保证充足睡眠，避免过度紧张。")
		}
		scoreCount++
	} else {
		eval.HeartRateStatus = "未检测"
	}

	if record.BodyFat > 0 {
		if record.BodyFat < 10 {
			eval.BodyFatStatus = "偏低"
			totalScore += 65
			suggestions = append(suggestions, "您的体脂率偏低，建议适当增加营养摄入，注意膳食平衡。")
		} else if record.BodyFat >= 10 && record.BodyFat < 20 {
			eval.BodyFatStatus = "正常"
			totalScore += 90
			suggestions = append(suggestions, "您的体脂率在正常范围内，继续保持。")
		} else if record.BodyFat >= 20 && record.BodyFat < 30 {
			eval.BodyFatStatus = "偏高"
			totalScore += 70
			suggestions = append(suggestions, "您的体脂率偏高，建议增加有氧运动，控制热量摄入。")
		} else {
			eval.BodyFatStatus = "过高"
			totalScore += 50
			suggestions = append(suggestions, "您的体脂率过高，建议制定科学的减重计划。")
		}
		scoreCount++
	} else {
		eval.BodyFatStatus = "未检测"
	}

	if scoreCount > 0 {
		eval.OverallScore = totalScore / scoreCount
	} else {
		eval.OverallScore = 0
	}

	eval.Suggestions = ""
	for i, s := range suggestions {
		eval.Suggestions += fmt.Sprintf("%d、%s\n", i+1, s)
	}

	if eval.Suggestions == "" {
		eval.Suggestions = "您提供的健康数据不足，建议完善身体指标信息以便获得更全面的健康评估。"
	}

	return eval
}
