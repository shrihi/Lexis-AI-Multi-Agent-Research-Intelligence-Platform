from pydantic import BaseSettings
import os

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str = ""
    TAVILY_API_KEY: str = ""
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"
    CHROMA_PERSIST_DIR: str = "/data/chroma" if os.getenv("RENDER") else "./chroma_data"
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()