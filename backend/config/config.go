package config

import (
	"os"
	"strconv"
)

type Config struct {
	Database DBConfig
	JWT      JWTConfig
	Server   ServerConfig
}

type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret     string
	ExpireTime int
}

type ServerConfig struct {
	Port int
}

func LoadConfig() *Config {
	return &Config{
		Database: DBConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvInt("DB_PORT", 3306),
			User:     getEnv("DB_USER", "root"),
			Password: getEnv("DB_PASSWORD", "123456"),
			DBName:   getEnv("DB_NAME", "health_manage"),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "health_manage_secret_key"),
			ExpireTime: getEnvInt("JWT_EXPIRE", 24),
		},
		Server: ServerConfig{
			Port: getEnvInt("SERVER_PORT", 8080),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
