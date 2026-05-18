from pydantic import BaseModel
from typing import List

class Source(BaseModel):
    id: str
    url: str
    title: str
    summary: str
    relevance_score: float

class Claim(BaseModel):
    text: str
    confidence: float
    source_ids: List[str]
    category: str

class Contradiction(BaseModel):
    claim_a: str
    claim_b: str
    source_a: str
    source_b: str
    explanation: str

class ModelUsage(BaseModel):
    agent: str
    model: str
    tokens_in: int
    tokens_out: int
    cost_usd: float

class ResearchReport(BaseModel):
    session_id: str
    query: str
    created_at: str
    status: str  # "running" | "complete" | "error"
    sub_questions: List[str]
    sources: List[Source]
    claims: List[Claim]
    contradictions: List[Contradiction]
    report_markdown: str
    model_usage: List[ModelUsage]
    total_cost_usd: float