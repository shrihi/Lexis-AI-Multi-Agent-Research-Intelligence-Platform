"""
OpenRouter service – thin wrapper around the OpenAI SDK configured for OpenRouter.
"""

import os
from typing import List, Dict, Any

import openai

# Mapping of internal names to valid OpenRouter model IDs
MODEL_MAP = {
    # Google Gemini
    "planning": "google/gemini-2.5-flash",
    "summarizing": "google/gemini-2.5-flash",

    # Claude
    "synthesis": "anthropic/claude-3.5-sonnet",
    "critique": "anthropic/claude-3.5-sonnet",
    "reporting": "anthropic/claude-3.5-sonnet",

    # Embeddings
    "embedding": "openai/text-embedding-3-small",
}


class OpenRouterService:
    def __init__(self):
        api_key = os.getenv("OPENROUTER_API_KEY")

        if not api_key:
            raise ValueError(
                "OPENROUTER_API_KEY is not set in environment variables"
            )

        self.client = openai.AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1"
        )

    async def chat(
        self,
        model_key: str,
        messages: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Send a chat completion request to OpenRouter.
        """

        model = MODEL_MAP.get(model_key, model_key)

        print(f"[OPENROUTER] Using model: {model}")

        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
            )

            return response.model_dump()

        except Exception as e:
            print(f"[OPENROUTER ERROR] {str(e)}")
            raise

    async def embed(self, texts: List[str]) -> List[float]:
        """
        Generate embeddings for text.
        """

        model = MODEL_MAP["embedding"]

        try:
            response = await self.client.embeddings.create(
                model=model,
                input=texts
            )

            return response.data[0].embedding

        except Exception as e:
            print(f"[EMBEDDING ERROR] {str(e)}")
            raise

    async def cost_and_tokens(
        self,
        model_key: str,
        usage: Dict[str, int]
    ):
        """
        Calculate approximate token usage and USD cost.
        """

        COST_PER_1K = {
            "google/gemini-2.5-flash": 0.0001,
            "anthropic/claude-3.5-sonnet": 0.003,
            "openai/text-embedding-3-small": 0.00002,
        }

        model_name = MODEL_MAP.get(model_key, model_key)
        cost_per_1k = COST_PER_1K.get(model_name, 0.0)

        tokens_in = usage.get("prompt_tokens", 0)
        tokens_out = usage.get("completion_tokens", 0)

        total_tokens = tokens_in + tokens_out

        cost_usd = (
            total_tokens / 1000
        ) * cost_per_1k

        return {
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "total_tokens": total_tokens,
            "cost_usd": round(cost_usd, 6),
        }