#!/usr/bin/env python3
"""
Orchestrator agent - manages the research pipeline and SSE communication.
"""

from typing import AsyncGenerator
from fastapi import Request
from sse_starlette.sse import EventSourceResponse
from datetime import datetime
import traceback

# Import other agents and services
from agents.planner import Planner
from agents.searcher import Searcher
from agents.synthesizer import Synthesizer
from agents.critic import Critic
from agents.reporter import Reporter

from services.openrouter import OpenRouterService
from services.memory import MemoryService
from services.embeddings import EmbeddingService

from models.research import ResearchReport


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

        # In-memory report storage
        self.reports = {}

    def save_report(self, session_id: str, report):
        """
        Save completed report in memory.
        """
        print(f"[DEBUG] Saving report for session: {session_id}")
        self.reports[session_id] = report
        print("[DEBUG] Report saved successfully")

    def get_report(self, session_id: str):
        """
        Retrieve report for a session.
        """
        report = self.reports.get(session_id)

        if report:
            print(f"[DEBUG] Report found for {session_id}")
        else:
            print(f"[DEBUG] No report found for {session_id}")

        return report

    async def run_research_pipeline(
        self,
        query: str,
        depth: int,
        session_id: str
    ) -> AsyncGenerator[dict, None]:
        """
        Run the full research pipeline and yield events for SSE.
        """

        try:
            print("\n========== RESEARCH PIPELINE STARTED ==========")
            print(f"SESSION ID: {session_id}")
            print(f"QUERY: {query}")
            print(f"DEPTH: {depth}")

            # STEP 1: Planner
            print("[STEP 1] Planner started")

            yield {
                "type": "thought",
                "agent": "PLANNER",
                "message": "Planning sub-questions..."
            }

            sub_questions = await self.planner.plan(query, depth)

            print(f"[STEP 1 COMPLETE] Generated {len(sub_questions)} sub-questions")

            yield {
                "type": "progress",
                "agent": "PLANNER",
                "message": f"Generated {len(sub_questions)} sub-questions"
            }

            # STEP 2: Searcher
            print("[STEP 2] Searcher started")

            yield {
                "type": "thought",
                "agent": "SEARCHER",
                "message": "Searching for sources..."
            }

            search_results = await self.searcher.search(sub_questions)

            print(f"[STEP 2 COMPLETE] Found {len(search_results)} sources")

            yield {
                "type": "progress",
                "agent": "SEARCHER",
                "message": f"Found {len(search_results)} sources"
            }

            # STEP 3: Synthesizer
            print("[STEP 3] Synthesizer started")

            yield {
                "type": "thought",
                "agent": "SYNTHESIZER",
                "message": "Synthesizing claims..."
            }

            claims = await self.synthesizer.synthesize(search_results)

            print(f"[STEP 3 COMPLETE] Extracted {len(claims)} claims")

            yield {
                "type": "progress",
                "agent": "SYNTHESIZER",
                "message": f"Extracted {len(claims)} claims"
            }

            # STEP 4: Critic
            print("[STEP 4] Critic started")

            yield {
                "type": "thought",
                "agent": "CRITIC",
                "message": "Checking for contradictions..."
            }

            contradictions = await self.critic.critique(claims)

            print(f"[STEP 4 COMPLETE] Found {len(contradictions)} contradictions")

            yield {
                "type": "progress",
                "agent": "CRITIC",
                "message": f"Found {len(contradictions)} contradictions"
            }

            # STEP 5: Reporter
            print("[STEP 5] Reporter started")

            yield {
                "type": "thought",
                "agent": "REPORTER",
                "message": "Generating report..."
            }

            report_markdown = await self.reporter.report(
                query,
                claims,
                contradictions,
                search_results
            )

            print("[STEP 5 COMPLETE] Report generated")

            yield {
                "type": "progress",
                "agent": "REPORTER",
                "message": "Report generated"
            }

            # STEP 6: Save report
            print("[STEP 6] Creating ResearchReport object")

            yield {
                "type": "thought",
                "agent": "MEMORY",
                "message": "Storing in memory..."
            }

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
                model_usage=[],
                total_cost_usd=0.0
            )

            print("[STEP 6] Saving to memory service")

            try:
                await self.memory.save_research(report)
                print("[DEBUG] Memory save successful")
            except Exception as memory_error:
                print("[WARNING] Memory save failed:")
                print(str(memory_error))

            print("[STEP 6] Saving report to orchestrator cache")

            self.save_report(
                session_id=session_id,
                report=report.dict()
            )

            print("========== RESEARCH COMPLETE ==========")

            yield {
                "type": "complete",
                "agent": "ORCHESTRATOR",
                "message": "Research complete"
            }

        except Exception as e:
            print("\n========== RESEARCH PIPELINE ERROR ==========")
            print(traceback.format_exc())

            yield {
                "type": "error",
                "agent": "ORCHESTRATOR",
                "message": f"Error: {str(e)}"
            }

    async def stream_research(
        self,
        query: str,
        depth: int,
        session_id: str,
        request: Request
    ) -> EventSourceResponse:
        """
        Generate SSE response for the research pipeline.
        """

        async def event_generator():
            async for event in self.run_research_pipeline(
                query=query,
                depth=depth,
                session_id=session_id
            ):
                if await request.is_disconnected():
                    print("[DEBUG] Client disconnected")
                    break

                yield {
                    "data": event
                }

        return EventSourceResponse(event_generator())