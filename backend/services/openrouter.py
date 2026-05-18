"""OpenRouter service – thin wrapper around the OpenAI SDK configured for OpenRouter.
"""

import os
from typing import List, Dict, Any

import openai

# Mapping of internal names to OpenRouter model ids – matches CLAUDE.md
MODEL_MAP = {
    "planning": "google/gemini-flash-1.5",
    "summarizing": "google/gemini-flash-1.5",
    "synthesis": "anthropic/claude-3-5-sonnet",
    "critique": "anthropic/claude-3-5-sonnet",
    "reporting": "anthropic/claude-3-5-sonnet",
    "embedding": "openai/text-embedding-3-small",
}


class OpenRouterService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
        )

    async def chat(self, model_key: str, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        model = MODEL_MAP.get(model_key, model_key)

        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
        )

        return response.model_dump()

    async def embed(self, texts: List[str]) -> List[float]:
        model = MODEL_MAP.get("embedding")

        response = await self.client.embeddings.create(
            model=model,
            input=texts
        )

        # Return first embedding vector
        return response.data[0].embedding

    async def cost_and_tokens(self, model_key: str, usage: Dict[str, int]):
        """Calculate token usage and approximate USD cost for a given model."""

        # Cost per 1,000 tokens (USD) – approximate values
        COST_PER_1K = {
            "google/gemini-flash-1.5": 0.0001,
            "anthropic/claude-3-5-sonnet": 0.0003,
            "openai/text-embedding-3-small": 0.00002,
        }

        model_name = MODEL_MAP.get(model_key, model_key)
        cost_per_1k = COST_PER_1K.get(model_name, 0.0)

        tokens_in = usage.get("prompt_tokens", 0)
        tokens_out = usage.get("completion_tokens", 0)

        total_tokens = tokens_in + tokens_out
        cost_usd = (total_tokens / 1000) * cost_per_1k

        return {
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "cost_usd": round(cost_usd, 6),
        }