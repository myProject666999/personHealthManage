package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"personHealthManage/database"
	"personHealthManage/models"
)

type CreateSportDetailRequest struct {
	KnowledgeID uint   `json:"knowledge_id" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Content     string `json:"content"`
	Duration    int    `json:"duration"`
	Calories    int    `json:"calories"`
	Level       string `json:"level"`
	ImageURL    string `json:"image_url"`
}

type UpdateSportDetailRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Content     string `json:"content"`
	Duration    int    `json:"duration"`
	Calories    int    `json:"calories"`
	Level       string `json:"level"`
	ImageURL    string `json:"image_url"`
}

func GetSportDetails(c *gin.Context) {
	knowledgeIDStr := c.Query("knowledge_id")
	if knowledgeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "缺少知识ID参数",
		})
		return
	}

	knowledgeID, err := strconv.ParseUint(knowledgeIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的知识ID",
		})
		return
	}

	var details []models.SportDetail
	if err := database.DB.Where("knowledge_id = ?", knowledgeID).Find(&details).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取运动详情列表失败",
		})
		return
	}

	var detailList []gin.H
	for _, d := range details {
		detailList = append(detailList, gin.H{
			"id":           d.ID,
			"knowledge_id": d.KnowledgeID,
			"title":        d.Title,
			"description":  d.Description,
			"content":      d.Content,
			"duration":     d.Duration,
			"calories":     d.Calories,
			"level":        d.Level,
			"image_url":    d.ImageURL,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": detailList,
	})
}

func GetSportDetailByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的详情ID",
		})
		return
	}

	var detail models.SportDetail
	if err := database.DB.First(&detail, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "运动详情不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"id":           detail.ID,
			"knowledge_id": detail.KnowledgeID,
			"title":        detail.Title,
			"description":  detail.Description,
			"content":      detail.Content,
			"duration":     detail.Duration,
			"calories":     detail.Calories,
			"level":        detail.Level,
			"image_url":    detail.ImageURL,
		},
	})
}

func CreateSportDetail(c *gin.Context) {
	var req CreateSportDetailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	var knowledge models.SportKnowledge
	if err := database.DB.First(&knowledge, req.KnowledgeID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "关联的运动知识不存在",
		})
		return
	}

	detail := models.SportDetail{
		KnowledgeID: req.KnowledgeID,
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		Duration:    req.Duration,
		Calories:    req.Calories,
		Level:       req.Level,
		ImageURL:    req.ImageURL,
	}

	if err := database.DB.Create(&detail).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建运动详情失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "创建成功",
		"data": gin.H{
			"id": detail.ID,
		},
	})
}

func UpdateSportDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的详情ID",
		})
		return
	}

	var req UpdateSportDetailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	var detail models.SportDetail
	if err := database.DB.First(&detail, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "运动详情不存在",
		})
		return
	}

	updates := make(map[string]interface{})
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Content != "" {
		updates["content"] = req.Content
	}
	if req.Duration > 0 {
		updates["duration"] = req.Duration
	}
	if req.Calories > 0 {
		updates["calories"] = req.Calories
	}
	if req.Level != "" {
		updates["level"] = req.Level
	}
	if req.ImageURL != "" {
		updates["image_url"] = req.ImageURL
	}

	if err := database.DB.Model(&detail).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
	})
}

func DeleteSportDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的详情ID",
		})
		return
	}

	if err := database.DB.Delete(&models.SportDetail{}, id).Error; err != nil {
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
