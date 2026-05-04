package main

import (
	"fmt"
	"log"

	"personHealthManage/config"
	"personHealthManage/database"
	"personHealthManage/routes"
)

func main() {
	cfg := config.LoadConfig()

	database.InitDB(cfg)

	r := routes.SetupRouter()

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
