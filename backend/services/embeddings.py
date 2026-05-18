"""Embeddings service – thin wrapper around OpenRouter embeddings.

Only a stub – calls OpenRouterService.embed which uses the OpenAI SDK.
"""
from .openrouter import OpenRouterService

class EmbeddingService:
    def __init__(self):
        self.client = OpenRouterService()

    async def embed_texts(self, texts):
        return await self.client.embed(texts)