"""Critic agent – checks for contradictions among claims.

Uses anthropic/claude-3-5-sonnet via OpenRouter to detect contradictions.
Returns a JSON array of Contradiction objects.
"""
import json
from typing import List
from ..models.research import Claim, Contradiction
from ..services.openrouter import OpenRouterService


class Critic:
    def __init__(self):
        self.openrouter = OpenRouterService()

    async def critique(self, claims: List[Claim]) -> List[Contradiction]:
        if len(claims) < 2:
            return []

        # Build claims context
        claims_text = "\n".join([f"{i+1}. {c.text} (confidence: {c.confidence})" for i, c in enumerate(claims)])

        messages = [
            {
                "role": "system",
                "content": "You are a research critic. Identify contradictions between claims. Return a JSON array of objects with 'claim_a', 'claim_b', 'source_a', 'source_b', 'explanation'."
            },
            {
                "role": "user",
                "content": f"Check these claims for contradictions:\n\n{claims_text}"
            }
        ]

        response = await self.openrouter.chat("critique", messages)
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "[]")

        try:
            contradictions_data = json.loads(content)
            contradictions = []
            for c in contradictions_data:
                if isinstance(c, dict):
                    contradictions.append(Contradiction(
                        claim_a=str(c.get("claim_a", "")),
                        claim_b=str(c.get("claim_b", "")),
                        source_a=str(c.get("source_a", "")),
                        source_b=str(c.get("source_b", "")),
                        explanation=str(c.get("explanation", "")),
                    ))
            return contradictions
        except (json.JSONDecodeError, TypeError):
            pass

        # Fallback: no contradictions detected
        return []
