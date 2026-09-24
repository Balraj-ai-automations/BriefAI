import os
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.generate import router as generate_router
from api.campaigns import router as campaigns_router
from api.auth import router as auth_router
from api.instagram import router as instagram_router


# ---------------------------------------------------------
# Application
# ---------------------------------------------------------

app = FastAPI(
    title="BriefAI Backend",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------

# Production frontend
PRODUCTION_FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://brief-ai-three.vercel.app",
).rstrip("/")


# Explicitly trusted origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    PRODUCTION_FRONTEND_URL,
]


# Allow Vercel preview/deployment URLs
#
# Example:
# https://brief-p3euwd0oo-balrajsrinivas03-4169s-projects.vercel.app
#
# This matches:
# https://<anything>.vercel.app
VERCEL_ORIGIN_REGEX = r"^https://[a-zA-Z0-9-]+\.vercel\.app$"


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=VERCEL_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# API Routers
# ---------------------------------------------------------

app.include_router(
    generate_router,
    prefix="/api",
)

app.include_router(
    campaigns_router,
    prefix="/api",
)

app.include_router(
    auth_router,
)

app.include_router(
    instagram_router,
)


# ---------------------------------------------------------
# Root Endpoint
# ---------------------------------------------------------

@app.get("/")
async def root():
    return {
        "service": "BriefAI Backend",
        "status": "running",
    }


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
    }