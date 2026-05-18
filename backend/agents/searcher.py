"""Searcher agent – uses Tavily search to retrieve sources for each sub-question.

Calls Tavily API for each sub-question and returns Source objects.
"""
import os
import aiohttp
from typing import List
from ..models.research import Source


TAVILY_API_URL = "https://api.tavily.com"


class Searcher:
    def __init__(self):
        self.api_key = os.getenv("TAVILY_API_KEY", "")

    async def search(self, sub_questions: List[str]) -> List[Source]:
        results: List[Source] = []

        if not self.api_key:
            # Fallback: return placeholder sources
            for i, q in enumerate(sub_questions):
                results.append(Source(
                    id=f"src-{i}",
                    url="https://example.com",
                    title=f"Result for {q[:30]}...",
                    summary="Tavily API key not configured – placeholder source.",
                    relevance_score=0.5,
                ))
            return results

        async with aiohttp.ClientSession() as session:
            for i, q in enumerate(sub_questions):
                try:
                    payload = {
                        "api_key": self.api_key,
                        "query": q,
                        "search_depth": "basic",
                        "max_results": 3,
                    }
                    async with session.post(f"{TAVILY_API_URL}/search", json=payload) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            for result in data.get("results", [])[:3]:
                                results.append(Source(
                                    id=f"src-{i}-{len(results)}",
                                    url=result.get("url", ""),
                                    title=result.get("title", ""),
                                    summary=result.get("content", ""),
                                    relevance_score=0.9,
                                ))
                        else:
                            results.append(Source(
                                id=f"src-{i}",
                                url="https://example.com",
                                title=f"Result for {q[:30]}...",
                                summary="Tavily search failed.",
                                relevance_score=0.3,
                            ))
                except Exception:
                    results.append(Source(
                        id=f"src-{i}-error",
                        url="https://example.com",
                        title=f"Error searching: {q[:30]}...",
                        summary="Search error – placeholder.",
                        relevance_score=0.0,
                    ))

        return results
