"""FastAPI main application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from app.config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    description="AI Governance platform for P&C and Commercial Insurance"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    # Ensure data and artifacts directories exist
    os.makedirs(settings.data_dir, exist_ok=True)
    os.makedirs(os.path.join(settings.artifacts_dir, "evidence_packs"), exist_ok=True)

    print(f"✓ {settings.app_name} started")
    print(f"✓ Data directory: {settings.data_dir}")
    print(f"✓ Artifacts directory: {settings.artifacts_dir}")
    print(f"✓ CORS origins: {settings.cors_origins_list}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.api_version,
        "data_dir_exists": os.path.exists(settings.data_dir),
        "artifacts_dir_exists": os.path.exists(settings.artifacts_dir),
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "app": settings.app_name,
        "version": settings.api_version,
        "docs": "/docs",
        "health": "/health"
    }


# Import and include routers
from app.routes import models, controls, evaluations, philosophy, evidence_packs, audit_log

app.include_router(models.router, prefix="/api/v1", tags=["models"])
app.include_router(controls.router, prefix="/api/v1", tags=["controls"])
app.include_router(evaluations.router, prefix="/api/v1", tags=["evaluations"])
app.include_router(philosophy.router, prefix="/api/v1", tags=["philosophy"])
app.include_router(evidence_packs.router, prefix="/api/v1", tags=["evidence_packs"])
app.include_router(audit_log.router, prefix="/api/v1", tags=["audit_log"])
