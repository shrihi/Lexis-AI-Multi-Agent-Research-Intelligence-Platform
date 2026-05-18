"""Synthesizer agent – creates claims from search results.

Uses anthropic/claude-3-5-sonnet via OpenRouter to extract claims with confidence scores.
Returns a JSON array of Claim objects.
"""
import json
from typing import List
from ..models.research import Claim, Source
from ..services.openrouter import OpenRouterService


class Synthesizer:
    def __init__(self):
        self.openrouter = OpenRouterService()

    async def synthesize(self, sources: List[Source]) -> List[Claim]:
        if not sources:
            return []

        # Build context from sources
        context = "\n".join([
            f"Source: {s.title}\nURL: {s.url}\nSummary: {s.summary}"
            for s in sources
        ])

        messages = [
            {
                "role": "system",
                "content": "You are a research synthesizer. Extract key claims from the provided sources. Return a JSON array of objects with 'text', 'confidence' (0-1), 'category'. Each claim should reference which source IDs support it."
            },
            {
                "role": "user",
                "content": f"Extract claims from these search results:\n\n{context}"
            }
        ]

        response = await self.openrouter.chat("synthesis", messages)
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "[]")

        try:
            claims_data = json.loads(content)
            claims = []
            for i, claim in enumerate(claims_data):
                if isinstance(claim, dict):
                    claims.append(Claim(
                        text=str(claim.get("text", f"Claim {i}")),
                        confidence=float(claim.get("confidence", 0.7)),
                        source_ids=[s.id for s in sources],
                        category=str(claim.get("category", "general")),
                    ))
            return claims
        except (json.JSONDecodeError, TypeError):
            pass

        # Fallback: create claims from source titles
        return [Claim(
            text=f"Claim from source: {s.title}",
            confidence=0.7,
            source_ids=[s.id],
            category="general",
        ) for s in sources]
