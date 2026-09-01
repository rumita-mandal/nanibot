import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import create_all_tables
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.wisdom import router as wisdom_router
from app.api.contribute import router as contribute_router
from app.api.archive import router as archive_router
from app.api.admin import router as admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing NaniBot database tables...")
    await create_all_tables()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    # Shutdown actions
    logger.info("Shutting down NaniBot API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A digital archive of intergenerational household wisdom with evidence-aware AI.",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded images/audio
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(wisdom_router)
app.include_router(contribute_router)
app.include_router(archive_router)
app.include_router(admin_router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
