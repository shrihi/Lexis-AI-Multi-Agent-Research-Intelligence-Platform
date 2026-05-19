from fastapi import APIRouter, HTTPException, Request
from typing import Tuple, Dict
from pydantic import BaseModel
from uuid import uuid4
import asyncio

# Orchestrator instance (shared)
from agents.orchestrator import Orchestrator

router = APIRouter()

# In-memory store for session metadata (query, depth)
_session_store: Dict[str, Tuple[str, int]] = {}

# Shared orchestrator instance
_orchestrator = Orchestrator()


class ResearchRequest(BaseModel):
    query: str
    depth: int = 3


class ResearchResponse(BaseModel):
    session_id: str


@router.post("/research/start", response_model=ResearchResponse)
async def start_research(request: ResearchRequest):
    """
    Create a new research session and store its parameters.
    Returns a UUID that the frontend can use for streaming
    and fetching the report.
    """

    session_id = uuid4().hex

    _session_store[session_id] = (
        request.query,
        request.depth
    )

    return {"session_id": session_id}


@router.get("/research/stream/{session_id}")
async def stream_research(session_id: str, request: Request):
    """
    SSE endpoint that streams the orchestrator pipeline.
    """

    if session_id not in _session_store:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    query, depth = _session_store[session_id]

    return await _orchestrator.stream_research(
        query=query,
        depth=depth,
        session_id=session_id,
        request=request
    )


@router.get("/research/report/{session_id}")
async def get_report(session_id: str):
    """
    Fetch final report for a completed session.
    Wait for report generation if still running.
    """

    if session_id not in _session_store:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    # Wait up to 30 seconds for report generation
    for _ in range(30):

        report = _orchestrator.get_report(session_id)

        if report:
            return report

        await asyncio.sleep(1)

    raise HTTPException(
        status_code=404,
        detail="Report not found yet"
    )


@router.get("/research/history")
async def get_history():
    """
    Return list of research sessions.
    """

    return {
        "sessions": list(_session_store.keys())
    }