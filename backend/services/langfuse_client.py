"""Langfuse client stub – in production this would wrap the Langfuse SDK for tracing.

For now it provides no‑op methods so imports succeed.
"""

class LangfuseClient:
    def __init__(self):
        pass
    def trace(self, *args, **kwargs):
        return self
    def start(self, *args, **kwargs):
        return self
    def end(self, *args, **kwargs):
        return self