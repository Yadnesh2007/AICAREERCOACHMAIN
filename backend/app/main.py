from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base, SessionLocal
from .models import db_models
from .data.seed import seed_database

# Routers
from .api import health, github, jobs, assessments, events, webhooks, innovations, demo, career_coach

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial data
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SkillAura AI Career Coach — Every Skill Has Evidence. Shared API Contract Implementation.",
    openapi_url="/openapi.json"
)

# CORS Middleware
origins = [origin.strip() for origin in settings.FRONTEND_ORIGIN.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(github.router)
app.include_router(jobs.router)
app.include_router(assessments.router)
app.include_router(events.router)
app.include_router(webhooks.router)
app.include_router(innovations.router)
app.include_router(demo.router)
app.include_router(career_coach.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
