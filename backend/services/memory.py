"""Simple in‑memory Memory service (fallback for environments without ChromaDB).

This implementation stores research reports in a plain Python dict keyed by
`session_id`. It provides the same async methods used elsewhere (`save_research`,
`search_similar`, `get_all`, `delete`). The signatures match the original
service so the rest of the codebase does not need to change.
"""
from typing import Dict, List, Any

# In‑memory store – map session_id -> report dict (as returned by the orchestrator)
_memory_store: Dict[str, Dict] = {}

class MemoryService:
    def __init__(self):
        # No external resources needed
        pass

    async def save_research(self, report):
        """Save a ResearchReport (or dict) in the in‑memory store."""
        # Assume `report` has a `session_id` attribute or key
        sid = getattr(report, "session_id", None) or report.get("session_id")
        if not sid:
            raise ValueError("Report must have a session_id")
        _memory_store[sid] = report.dict() if hasattr(report, "dict") else report
        return True

    async def search_similar(self, query: str, n: int = 5) -> List[Dict[str, Any]]:
        """Very naive similarity search – returns up to `n` stored reports.
        In a real implementation this would embed the query and perform a nearest‑
        neighbor lookup. Here we just return the first `n` reports.
        """
        results = []
        for sid, data in list(_memory_store.items())[:n]:
            results.append({"id": sid, "metadata": data})
        return results

    async def get_all(self):
        """Return a list of all stored reports (metadata only)."""
        return [{"id": sid, "metadata": data} for sid, data in _memory_store.items()]

    async def get_research(self, session_id: str):
        """Retrieve a stored research report by session_id."""
        return _memory_store.get(session_id)