export interface ResearchReport {
  session_id: string;
  query: string;
  created_at: string;
  status: 'running' | 'complete' | 'error';
  sub_questions: string[];
  sources: Source[];
  claims: Claim[];
  contradictions: Contradiction[];
  report_markdown: string;
  model_usage: ModelUsage[];
  total_cost_usd: number;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  summary: string;
  relevance_score: number;
}

export interface Claim {
  text: string;
  confidence: number;
  source_ids: string[];
  category: string;
}

export interface Contradiction {
  claim_a: string;
  claim_b: string;
  source_a: string;
  source_b: string;
  explanation: string;
}

export interface AgentThought {
  type: "thought" | "progress" | "complete" | "error";
  agent: string;
  message: string;
  timestamp?: string;
  model?: string;
}

export interface ModelUsage {
  agent: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
}