"""
CinePredict AI - Movie Box Office Intelligence Platform
FastAPI Application Entry Point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import predict, movies, analytics, history
from app.models.database import init_db
from ml.inference import get_pipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQLite database and preheats ML model pipeline on startup."""
    print("[Startup] Initializing SQLite database schema...")
    init_db()
    
    print("[Startup] Preheating ML model pipeline...")
    try:
        pipeline = get_pipeline()
        print(f"[Startup] ML Pipeline ready. Champion model: {pipeline.get('champion_name')}")
    except Exception as e:
        print(f"[Startup Warning] Could not preheat ML model pipeline: {e}")
        
    yield
    print("[Shutdown] CinePredict AI platform shutting down gracefully.")

app = FastAPI(
    title="CinePredict AI — Movie Box Office Intelligence Platform API",
    description="Original full-stack machine learning platform for pre-release theatrical revenue estimation, studio financial analytics, and sensitivity simulation.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(predict.router)
app.include_router(movies.router)
app.include_router(analytics.router)
app.include_router(history.router)

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint validating API and model availability."""
    model_status = "loaded"
    try:
        get_pipeline()
    except Exception:
        model_status = "unavailable"
        
    return {
        "status": "healthy",
        "service": "CinePredict AI API",
        "version": "1.0.0",
        "model_status": model_status
    }

@app.get("/", tags=["Root"])
def root():
    """Root platform index with endpoint directory."""
    return {
        "platform": "CinePredict AI — Movie Box Office Intelligence Platform",
        "docs_url": "/docs",
        "health_url": "/health",
        "endpoints": {
            "predict": "/api/predict",
            "compare": "/api/compare",
            "movies": "/api/movies",
            "similar": "/api/movies/similar",
            "analytics_kpis": "/api/analytics/kpis",
            "model_metrics": "/api/model/metrics",
            "prediction_history": "/api/predictions"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
