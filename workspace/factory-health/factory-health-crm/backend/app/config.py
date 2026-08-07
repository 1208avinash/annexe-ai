import os


class Settings:
    app_name = os.getenv("APP_NAME", "Factory Health CRM")
    app_env = os.getenv("APP_ENV", "development")
    database_url = os.getenv("DATABASE_URL", "sqlite:///./crm.db")
    secret_key = os.getenv("SECRET_KEY", "change-me")
    cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]


settings = Settings()
