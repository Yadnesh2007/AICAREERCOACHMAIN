import os

class Settings:
    PROJECT_NAME: str = "SkillAura AI Career Coach"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./careerproof.db")
    
    # CORS
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173")
    
    # GitHub App & Webhook
    GITHUB_APP_ID: str = os.getenv("GITHUB_APP_ID", "mock-app-id")
    GITHUB_WEBHOOK_SECRET: str = os.getenv("GITHUB_WEBHOOK_SECRET", "careerproof_secure_webhook_secret_2026")
    
    # LLM Provider
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("API_KEY", ""))

settings = Settings()
