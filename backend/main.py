#!/usr/bin/env python3
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS setup for development and Netlify
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.netlify.app"],  # Development and Netlify
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from routers import research, memory, health
app.include_router(research.router, prefix="/api", tags=["research"])
app.include_router(memory.router, prefix="/api", tags=["memory"])
app.include_router(health.router, prefix="/api", tags=["health"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": __import__('datetime').datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )