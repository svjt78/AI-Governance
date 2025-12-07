"""Application configuration"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Application info
    app_name: str = "InsureGov AI Governance"
    api_version: str = "v1"

    # Data directories
    data_dir: str = "/app/data"
    artifacts_dir: str = "/app/artifacts"

    # OpenAI configuration
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"

    # CORS configuration
    cors_origins: str = "http://localhost:3006"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS origins string to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()
