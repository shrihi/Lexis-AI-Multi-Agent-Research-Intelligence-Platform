"""Planner agent – generates sub-questions from the user query.

Uses google/gemini-flash-1.5 via OpenRouter to break the query into 4-6 sub-questions.
Returns a JSON array of sub-questions.
"""
import json
import asyncio
from typing import List
import openai
from services.openrouter import OpenRouterService


class Planner:
    def __init__(self):
        self.openrouter = OpenRouterService()

    async def plan(self, query: str, depth: int) -> List[str]:
        # Use the OpenRouter service to call google/gemini-flash-1.5
        messages = [
            {
                "role": "system",
                "content": "You are a research planner. Break the user's query into focused sub-questions that can be searched independently. Return a JSON array of strings."
            },
            {
                "role": "user",
                "content": f"Break this research query into {depth} sub-questions:\n\n{query}"
            }
        ]

        response = await self.openrouter.chat("planning", messages)
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "[]")

        try:
            sub_questions = json.loads(content)
            if isinstance(sub_questions, list):
                return [str(q) for q in sub_questions[:depth]]
        except json.JSONDecodeError:
            pass

        # Fallback: return depth versions of the query
        return [f"Sub-question {i+1}: {query}" for i in range(depth)]
