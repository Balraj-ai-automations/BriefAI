from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.generate import router as generate_router
from api.campaigns import router as campaigns_router

app = FastAPI(
    title="BriefAI Backend",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
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

# Health Check Endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}