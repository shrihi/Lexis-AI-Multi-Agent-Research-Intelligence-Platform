from fastapi import APIRouter, HTTPException, Request
from typing import List, Tuple, Dict
from pydantic import BaseModel
from uuid import uuid4

router = APIRouter()

# In‑memory store for session metadata (query, depth)
_session_store: Dict[str, Tuple[str, int]] = {}

# Orchestrator instance (shared)
from agents.orchestrator import Orchestrator
_orchestrator = Orchestrator()

class ResearchRequest(BaseModel):
    query: str
    depth: int = 3

class ResearchResponse(BaseModel):
    session_id: str

@router.post("/research/start", response_model=ResearchResponse)
async def start_research(request: ResearchRequest):
    """Create a new research session and store its parameters.
    Returns a UUID that the frontend can use for streaming and fetching the report.
    """
    session_id = uuid4().hex
    _session_store[session_id] = (request.query, request.depth)
    return {"session_id": session_id}

@router.get("/research/stream/{session_id}")
async def stream_research(session_id: str, request: Request):
    """SSE endpoint that streams the orchestrator pipeline.
    The orchestrator yields AgentThought dicts which are sent as SSE data events.
    """
    if session_id not in _session_store:
        raise HTTPException(status_code=404, detail="Session not found")
    query, depth = _session_store[session_id]
    # Delegate to the orchestrator's streaming helper
    return await _orchestrator.stream_research(query, depth, session_id, request)

@router.get("/research/report/{session_id}")
async def get_report(session_id: str):
    """Fetch the final report for a completed session."""
    if session_id not in _session_store:
        raise HTTPException(status_code=404, detail="Session not found")
    # Retrieve from memory service
    report = _orchestrator.get_report(session_id)
    if not report:
            raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/research/history")
async def get_history():
    """Return a list of all session IDs that have been started.
    In a production system you would pull this from persistent storage.
    """
    return list(_session_store.keys())

# Router will be included in main app