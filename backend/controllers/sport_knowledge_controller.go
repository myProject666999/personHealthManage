package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"personHealthManage/database"
	"personHealthManage/models"
)

type CreateSportKnowledgeRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Content     string `json:"content"`
	Category    string `json:"category"`
	ImageURL    string `json:"image_url"`
}

type UpdateSportKnowledgeRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Content     string `json:"content"`
	Category    string `json:"category"`
	ImageURL    string `json:"image_url"`
}

func GetSportKnowledges(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")
	keyword := c.Query("keyword")

	var total int64
	query := database.DB.Model(&models.SportKnowledge{})

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	var knowledges []models.SportKnowledge
	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&knowledges).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "获取运动知识列表失败",
		})
		return
	}

	var knowledgeList []gin.H
	for _, k := range knowledges {
		knowledgeList = append(knowledgeList, gin.H{
			"id":          k.ID,
			"title":       k.Title,
			"description": k.Description,
			"content":     k.Content,
			"category":    k.Category,
			"image_url":   k.ImageURL,
			"views":       k.Views,
			"created_at":  k.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      knowledgeList,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetSportKnowledgeByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的知识ID",
		})
		return
	}

	var knowledge models.SportKnowledge
	if err := database.DB.Preload("SportDetails").First(&knowledge, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "运动知识不存在",
		})
		return
	}

	database.DB.Model(&knowledge).Update("views", knowledge.Views+1)

	var details []gin.H
	for _, d := range knowledge.SportDetails {
		details = append(details, gin.H{
			"id":          d.ID,
			"title":       d.Title,
			"description": d.Description,
			"duration":    d.Duration,
			"calories":    d.Calories,
			"level":       d.Level,
			"image_url":   d.ImageURL,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"id":           knowledge.ID,
			"title":        knowledge.Title,
			"description":  knowledge.Description,
			"content":      knowledge.Content,
			"category":     knowledge.Category,
			"image_url":    knowledge.ImageURL,
			"views":        knowledge.Views,
			"sport_details": details,
			"created_at":   knowledge.CreatedAt,
		},
	})
}

func CreateSportKnowledge(c *gin.Context) {
	var req CreateSportKnowledgeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	knowledge := models.SportKnowledge{
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		Category:    req.Category,
		ImageURL:    req.ImageURL,
		Views:       0,
	}

	if err := database.DB.Create(&knowledge).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建运动知识失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "创建成功",
		"data": gin.H{
			"id": knowledge.ID,
		},
	})
}

func UpdateSportKnowledge(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的知识ID",
		})
		return
	}

	var req UpdateSportKnowledgeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	var knowledge models.SportKnowledge
	if err := database.DB.First(&knowledge, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "运动知识不存在",
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
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.ImageURL != "" {
		updates["image_url"] = req.ImageURL
	}

	if err := database.DB.Model(&knowledge).Updates(updates).Error; err != nil {
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

func DeleteSportKnowledge(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的知识ID",
		})
		return
	}

	database.DB.Where("knowledge_id = ?", id).Delete(&models.SportDetail{})

	if err := database.DB.Delete(&models.SportKnowledge{}, id).Error; err != nil {
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
