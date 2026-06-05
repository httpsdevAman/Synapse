from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    REPOS_DIR: str = "./repositories"
    VECTOR_STORE_DIR: str = "./vector_store"
    EMBEDDING_MODEL: str = "all-MiniLML6-v2"
    GROQ_API_KEY: str
    GROQ_MODEL: str ="llama-3.3-70b-versatile"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

Path(settings.REPOS_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.VECTOR_STORE_DIR).mkdir(parents=True, exist_ok=True)