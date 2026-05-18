#!/usr/bin/env python3
"""
Orchestrator agent - manages the research pipeline and SSE communication.
"""
import asyncio
from typing import AsyncGenerator
from fastapi import Request
from sse_starlette.sse import EventSourceResponse

# Import other agents and services
from .planner import Planner
from .searcher import Searcher
from .synthesizer import Synthesizer
from .critic import Critic
from .reporter import Reporter
from ..services.openrouter import OpenRouterService
from ..services.memory import MemoryService
from ..services.embeddings import EmbeddingService
from ..models.research import ResearchReport

class Orchestrator:
    def __init__(self):
        self.planner = Planner()
        self.searcher = Searcher()
        self.synthesizer = Synthesizer()
        self.critic = Critic()
        self.reporter = Reporter()
        self.openrouter = OpenRouterService()
        self.memory = MemoryService()
        self.embeddings = EmbeddingService()

    async def run_research_pipeline(self, query: str, depth: int, session_id: str) -> AsyncGenerator[dict, None]:
        """
        Run the full research pipeline and yield events for SSE.
        """
        from datetime import datetime

        try:
            # Step 1: Planner
            yield {"type": "thought", "agent": "PLANNER", "message": "Planning sub-questions..."}
            sub_questions = await self.planner.plan(query, depth)
            yield {"type": "progress", "agent": "PLANNER", "message": f"Generated {len(sub_questions)} sub-questions"}

            # Step 2: Searcher
            yield {"type": "thought", "agent": "SEARCHER", "message": "Searching for sources..."}
            search_results = await self.searcher.search(sub_questions)
            yield {"type": "progress", "agent": "SEARCHER", "message": f"Found {len(search_results)} sources"}

            # Step 3: Synthesizer
            yield {"type": "thought", "agent": "SYNTHESIZER", "message": "Synthesizing claims..."}
            claims = await self.synthesizer.synthesize(search_results)
            yield {"type": "progress", "agent": "SYNTHESIZER", "message": f"Extracted {len(claims)} claims"}

            # Step 4: Critic
            yield {"type": "thought", "agent": "CRITIC", "message": "Checking for contradictions..."}
            contradictions = await self.critic.critique(claims)
            yield {"type": "progress", "agent": "CRITIC", "message": f"Found {len(contradictions)} contradictions"}

            # Step 5: Reporter
            yield {"type": "thought", "agent": "REPORTER", "message": "Generating report..."}
            report_markdown = await self.reporter.report(query, claims, contradictions, search_results)
            yield {"type": "progress", "agent": "REPORTER", "message": "Report generated"}

            # Step 6: Memory
            yield {"type": "thought", "agent": "MEMORY", "message": "Storing in memory..."}
            report = ResearchReport(
                session_id=session_id,
                query=query,
                created_at=datetime.now().isoformat(),
                status="complete",
                sub_questions=sub_questions,
                sources=search_results,
                claims=claims,
                contradictions=contradictions,
                report_markdown=report_markdown,
                model_usage=[],  # Would be populated by services
                total_cost_usd=0.0
            )
            await self.memory.save_research(report)
            yield {"type": "complete", "agent": "ORCHESTRATOR", "message": "Research complete"}

        except Exception as e:
            yield {"type": "error", "agent": "ORCHESTRATOR", "message": f"Error: {str(e)}"}

    async def stream_research(self, query: str, depth: int, session_id: str, request: Request) -> EventSourceResponse:
        """
        Generate SSE response for the research pipeline.
        """
        async def event_generator():
            async for event in self.run_research_pipeline(query, depth, session_id):
                if await request.is_disconnected():
                    break
                yield {
                    "data": event
                }

        return EventSourceResponse(event_generator())