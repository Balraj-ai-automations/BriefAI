from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.generate import router as generate_router
from api.campaigns import router as campaigns_router
from api.auth import router as auth_router
from api.instagram import router as instagram_router

app = FastAPI(
    title="BriefAI Backend",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://briefai.vercel.app",  # Update with your actual Vercel domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
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

# Health Check Endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}