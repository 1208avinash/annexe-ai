import os


class Settings:
    app_name = os.getenv("APP_NAME", "Enterprise CRM")
    app_env = os.getenv("APP_ENV", "development")
    build_version = os.getenv("BUILD_VERSION", "5.0.0")
    database_url = os.getenv("DATABASE_URL", "sqlite:///./crm.db")
    secret_key = os.getenv("SECRET_KEY", "change-me-in-production")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    admin_email = os.getenv("ADMIN_EMAIL", "admin@annexe.ai")
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!")
    log_level = os.getenv("LOG_LEVEL", "INFO")
    default_locale = os.getenv("DEFAULT_LOCALE", "fr-FR")
    supported_locales = [
        locale.strip()
        for locale in os.getenv("SUPPORTED_LOCALES", "en-US,fr-FR,es-ES,de-DE,ar-SA,hi-IN,zh-CN,ja-JP,pt-BR,it-IT").split(",")
        if locale.strip()
    ]
    default_language = os.getenv("DEFAULT_LANGUAGE", "French")
    cors_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]


settings = Settings()
