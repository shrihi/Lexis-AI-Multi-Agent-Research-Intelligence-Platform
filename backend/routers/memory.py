from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

router = APIRouter()

@router.get("/memory/search")
async def search_memory(q: str, n: int = 5):
    return {"query": q, "n": n, "results": []}

@router.get("/memory/all")
async def get_all_sessions():
    return []

@router.delete("/memory/{session_id}")
async def delete_session(session_id: str):
    return {"deleted": session_id}

