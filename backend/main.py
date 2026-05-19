#!/usr/bin/env python3

import os
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Lexis AI Backend"
)

# Allowed frontend URLs
origins = [
    "http://localhost:3000",
    "https://lexisaimultiagentresearchplatform.netlify.app",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from routers import research, memory, health

app.include_router(
    research.router,
    prefix="/api",
    tags=["research"]
)

app.include_router(
    memory.router,
    prefix="/api",
    tags=["memory"]
)

app.include_router(
    health.router,
    prefix="/api",
    tags=["health"]
)


@app.get("/")
async def root():
    return {
        "message": "Lexis AI Backend Running"
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )