from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), env_file_encoding="utf-8", extra="ignore")

    # App
    APP_NAME: str = "NaniBot"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://nanibot:nanibot_secret@localhost:5432/nanibot_db"
    POSTGRES_USER: str = "nanibot"
    POSTGRES_PASSWORD: str = "nanibot_secret"
    POSTGRES_DB: str = "nanibot_db"

    # JWT
    SECRET_KEY: str = "change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Google Gemini (Free)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # CORS
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000"]'

    @property
    def cors_origins(self) -> List[str]:
        try:
            return json.loads(self.BACKEND_CORS_ORIGINS)
        except Exception:
            return ["http://localhost:3000"]

    # Admin
    ADMIN_EMAIL: str = "admin@nanibot.com"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_NAME: str = "Admin"

    # Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    CHROMA_COLLECTION: str = "nanibot_wisdom"


settings = Settings()
