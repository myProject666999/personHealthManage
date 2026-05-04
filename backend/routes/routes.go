package routes

import (
	"github.com/gin-gonic/gin"

	"personHealthManage/controllers"
	"personHealthManage/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", controllers.Login)
			auth.POST("/register", controllers.Register)
		}

		user := api.Group("/user")
		user.Use(middleware.JWTAuth())
		{
			user.GET("/profile", controllers.GetProfile)
			user.PUT("/profile", controllers.UpdateProfile)
			user.PUT("/password", controllers.ChangePassword)

			health := user.Group("/health")
			{
				health.GET("/records", controllers.GetMyHealthRecords)
				health.POST("/records", controllers.CreateHealthRecord)
				health.GET("/records/:id", controllers.GetHealthRecordByID)
				health.PUT("/records/:id", controllers.UpdateHealthRecord)
				health.DELETE("/records/:id", controllers.DeleteHealthRecord)

				health.GET("/stats", controllers.GetHealthStats)

				health.GET("/evaluation", controllers.EvaluateHealth)
				health.GET("/evaluations", controllers.GetMyEvaluations)
			}

			sport := user.Group("/sport")
			{
				sport.GET("/knowledges", controllers.GetSportKnowledges)
				sport.GET("/knowledges/:id", controllers.GetSportKnowledgeByID)
				sport.GET("/details", controllers.GetSportDetails)
				sport.GET("/details/:id", controllers.GetSportDetailByID)
			}
		}

		admin := api.Group("/admin")
		admin.Use(middleware.JWTAuth(), middleware.AdminAuth())
		{
			admin.GET("/users", controllers.GetUsers)
			admin.GET("/users/:id", controllers.GetUserByID)
			admin.POST("/users", controllers.CreateUser)
			admin.PUT("/users/:id", controllers.UpdateUser)
			admin.DELETE("/users/:id", controllers.DeleteUser)

			admin.GET("/roles", controllers.GetRoles)
			admin.GET("/roles/:id", controllers.GetRoleByID)
			admin.POST("/roles", controllers.CreateRole)
			admin.PUT("/roles/:id", controllers.UpdateRole)
			admin.DELETE("/roles/:id", controllers.DeleteRole)

			sport := admin.Group("/sport")
			{
				sport.GET("/knowledges", controllers.GetSportKnowledges)
				sport.GET("/knowledges/:id", controllers.GetSportKnowledgeByID)
				sport.POST("/knowledges", controllers.CreateSportKnowledge)
				sport.PUT("/knowledges/:id", controllers.UpdateSportKnowledge)
				sport.DELETE("/knowledges/:id", controllers.DeleteSportKnowledge)

				sport.GET("/details", controllers.GetSportDetails)
				sport.GET("/details/:id", controllers.GetSportDetailByID)
				sport.POST("/details", controllers.CreateSportDetail)
				sport.PUT("/details/:id", controllers.UpdateSportDetail)
				sport.DELETE("/details/:id", controllers.DeleteSportDetail)
			}

			health := admin.Group("/health")
			{
				health.GET("/records", controllers.GetHealthRecords)
				health.GET("/records/:id", controllers.GetHealthRecordByID)
				health.DELETE("/records/:id", controllers.DeleteHealthRecord)

				health.GET("/evaluations", controllers.GetEvaluations)
			}
		}
	}

	return r
}
