# Lexis AI — Project Intelligence

## What This Project Is
A production-grade multi-agent AI research analyst. Users enter any research
question, and Lexis autonomously plans sub-questions, searches the web, reads
sources, synthesizes findings with confidence scores, detects contradictions
between sources, stores everything in persistent vector memory, and delivers a
structured cited report — all streamed live so users watch the agent think.

Built as a portfolio project targeting AI Engineering / AI Orchestration roles.
Every technical decision is intentional and explainable in interviews.

## Tech Stack
- Frontend: Next.js 14 (App Router) + TypeScript strict mode + Tailwind CSS
- UI Components: shadcn/ui (button, card, badge, input, textarea, progress,
  separator, tooltip, sheet, skeleton, toast)
- Animations: Framer Motion
- State: Zustand
- Data Fetching: TanStack React Query v5
- HTTP Client: Axios
- Markdown Rendering: react-markdown + remark-gfm
- Charts: Recharts
- Notifications: Sonner
- Icons: Lucide React
- Fonts: Geist (display/body) + JetBrains Mono (terminal/code)
- Backend: FastAPI (Python 3.11+)
- LLM Routing: OpenRouter API (openai Python SDK, custom base_url)
- Agent Framework: LangChain
- Web Search: Tavily API
- Vector Memory: ChromaDB (persistent)
- Embeddings: OpenAI text-embedding-3-small via OpenRouter
- Observability: Langfuse
- PDF Parsing: PyMuPDF (fitz)
- Deployment: Frontend → Netlify, Backend → Render (Docker)

## Design System
Dark editorial intelligence-tool aesthetic. Think Bloomberg Terminal meets
Linear. NOT purple gradient AI slop. Sharp, minimal, data-dense.

- Background primary: #0a0a0a
- Background surface: #111111
- Background elevated: #1a1a1a
- Border: #2a2a2a
- Text primary: #f0f0f0
- Text secondary: #888888
- Text muted: #444444
- Accent green: #00ff88  (agent activity, live indicators, success)
- Accent blue: #4488ff   (links, sources, interactive)
- Accent amber: #ffaa00  (warnings, contradictions)
- Accent red: #ff4444    (errors)
- Font display/body: Geist (next/font/google)
- Font mono: JetBrains Mono (agent stream, data, code blocks)

CSS custom properties for all colors. No hardcoded hex values in components.
Dark mode only. Subtle dot-grid background texture on all pages via CSS
radial-gradient. Custom scrollbar: thin, dark, green accent thumb.

## Project Structure
frontend/
  app/
    layout.tsx                → Root layout, Geist font, Navbar, QueryProvider
    page.tsx                  → Landing/Hero page
    providers.tsx             → React Query + Sonner provider (client component)
    research/
      page.tsx                → Research console (input + live agent stream)
      [id]/page.tsx           → Report viewer
    memory/
      page.tsx                → Memory browser (past sessions, semantic search)
  components/
    layout/
      Navbar.tsx              → Logo + nav links + mobile sheet
    research/
      ResearchForm.tsx        → Query input, depth selector, submit button
      AgentThoughtStream.tsx  → Terminal-style SSE live feed
      ReportViewer.tsx        → Markdown report with react-markdown
      SourceCard.tsx          → Source with relevance bar, hover preview
      ContradictionAlert.tsx  → Collapsible amber contradiction card
      ConfidenceChart.tsx     → Recharts horizontal bar by claim category
      ModelUsagePanel.tsx     → Agent | Model | Tokens | Cost table
    memory/
      MemoryCard.tsx          → Past session card with delete
      MemorySearch.tsx        → Debounced semantic search input
    shared/
      LoadingOrb.tsx          → Animated pulsing orb with optional label
  lib/
    api.ts                    → Axios instance + all typed API functions
    store.ts                  → Zustand store (activeSession state)
    types.ts                  → All TypeScript interfaces

backend/
  main.py                     → FastAPI app, CORS, startup, router registration
  config.py                   → Pydantic BaseSettings, all env vars
  routers/
    research.py               → /api/research/* endpoints
    memory.py                 → /api/memory/* endpoints
    health.py                 → /api/health
  agents/
    orchestrator.py           → Main pipeline runner, SSE queue manager
    planner.py                → Breaks query into 4-6 sub-questions
    searcher.py               → Tavily search per sub-question
    synthesizer.py            → Extracts claims with confidence scores
    critic.py                 → Detects contradictions between claims
    reporter.py               → Generates final markdown report
  services/
    openrouter.py             → OpenRouter client, model routing, cost tracking
    memory.py                 → ChromaDB read/write/search/delete
    embeddings.py             → text-embedding-3-small via OpenRouter
    langfuse_client.py        → Trace wrapper stub (include even if optional)
  models/
    research.py               → All Pydantic v2 models
  utils/
    text_utils.py             → Chunking, cleaning helpers
  Dockerfile
  requirements.txt

## Environment Variables

Backend .env:
  OPENROUTER_API_KEY          → From openrouter.ai (required)
  TAVILY_API_KEY              → From tavily.com (required)
  LANGFUSE_PUBLIC_KEY         → From cloud.langfuse.com (optional)
  LANGFUSE_SECRET_KEY         → From cloud.langfuse.com (optional)
  LANGFUSE_HOST               → https://cloud.langfuse.com
  CHROMA_PERSIST_DIR          → ./chroma_data
  FRONTEND_URL                → http://localhost:3000

Frontend .env.local:
  NEXT_PUBLIC_API_URL         → http://localhost:8000

## Routes
/              → Hero: tagline, search bar CTA, how-it-works, feature grid
/research      → Console: query input → live agent thought stream
/research/[id] → Report: markdown, sources, contradictions, confidence chart
/memory        → Memory browser: semantic search over past sessions

## Agent Pipeline (exact execution order)
1. PLANNER     model: google/gemini-flash-1.5        → 4-6 sub-questions (JSON array)
2. SEARCHER    model: none (tool call)               → Tavily search per sub-question
3. SYNTHESIZER model: anthropic/claude-3-5-sonnet    → claims + confidence (JSON)
4. CRITIC      model: anthropic/claude-3-5-sonnet    → contradictions (JSON)
5. REPORTER    model: anthropic/claude-3-5-sonnet    → markdown report string
6. MEMORY      service: ChromaDB                     → embed + store session

Each step emits an AgentThought event into asyncio.Queue → streamed via SSE.
Planner/summarizing tasks use cheap fast model. Synthesis/critique/report use
the powerful model. This cost-aware routing is a key talking point.

## Data Models

TypeScript interfaces (frontend/lib/types.ts):

interface ResearchReport {
  session_id: string
  query: string
  created_at: string
  status: "running" | "complete" | "error"
  sub_questions: string[]
  sources: Source[]
  claims: Claim[]
  contradictions: Contradiction[]
  report_markdown: string
  model_usage: ModelUsage[]
  total_cost_usd: number
}
interface Source {
  id: string
  url: string
  title: string
  summary: string
  relevance_score: number
}
interface Claim {
  text: string
  confidence: number
  source_ids: string[]
  category: string
}
interface Contradiction {
  claim_a: string
  claim_b: string
  source_a: string
  source_b: string
  explanation: string
}
interface ModelUsage {
  agent: string
  model: string
  tokens_in: number
  tokens_out: number
  cost_usd: number
}
interface AgentThought {
  type: "thought" | "progress" | "complete" | "error"
  agent: string
  message: string
  timestamp: string
  model?: string
}

Pydantic v2 equivalents live in backend/models/research.py.

## API Endpoints

POST   /api/research/start              body: {query, depth}  → {session_id}
GET    /api/research/stream/{id}        SSE stream of AgentThought events
GET    /api/research/report/{id}        ResearchReport or 404
GET    /api/research/history            list of past sessions
GET    /api/memory/search?q={query}     semantic search results
GET    /api/memory/all                  all sessions, newest first
DELETE /api/memory/{session_id}         remove from ChromaDB
GET    /api/health                      {status: "ok", timestamp}

SSE headers: Cache-Control: no-cache, X-Accel-Buffering: no
SSE format: "data: {json}\n\n" — stream closes on complete or error event.

## OpenRouter Integration
- Use openai Python SDK with base_url="https://openrouter.ai/api/v1"
- API key from settings.OPENROUTER_API_KEY
- Model router dict in services/openrouter.py:
    "planning"    → "google/gemini-flash-1.5"
    "summarizing" → "google/gemini-flash-1.5"
    "synthesis"   → "anthropic/claude-3-5-sonnet"
    "critique"    → "anthropic/claude-3-5-sonnet"
    "reporting"   → "anthropic/claude-3-5-sonnet"
    "embedding"   → "openai/text-embedding-3-small"
- Track token usage and estimated cost per call, return ModelUsage object
- Retry with exponential backoff on 429 errors (max 3 retries)

## ChromaDB Memory
- Collection name: lexis_research_memory
- save_research(report): embed query+summary, store with metadata
- search_similar(query, n=5): embed query, cosine similarity search
- get_all(): all sessions ordered by created_at desc
- delete(session_id): delete by metadata filter
- Handle empty collection gracefully (return [] not error)

## UI Component Details

AgentThoughtStream:
- Terminal look: background #0a0a0a, JetBrains Mono, green text
- Line format: [AGENT_NAME] in #00ff88 + message in #f0f0f0
- Pulsing green block cursor at bottom while running
- Auto-scrolls to bottom on new events
- CSS scanline overlay (repeating-linear-gradient, very subtle opacity)
- "View Report →" button appears when type === "complete"
- Error shown in #ff4444 when type === "error"

ReportViewer:
- react-markdown with remark-gfm
- Custom prose styles: h1/h2 in green, code blocks dark with border,
  blockquotes with amber left border, links in blue
- Copy to clipboard button top-right
- Desktop: report left 70%, sources+model panel right 30%
- Mobile: full width, sources panel below report

ContradictionAlert:
- Amber (#ffaa00) border-left card
- Shows two conflicting claims side by side
- Explanation text below
- Collapsed by default, AnimatePresence expand/collapse

ConfidenceChart:
- Recharts HorizontalBar
- Color by confidence: green >0.7, amber 0.4-0.7, red <0.4
- Groups claims by category on Y axis

Landing hero:
- Heading: "Research Intelligence," + line break + "Powered by Multi-Agent AI"
- Subtext explaining Lexis
- Terminal-styled search bar with "> " prefix, full-width on mobile
- Submit navigates to /research?q={query}
- Two slow-moving CSS gradient blobs behind the heading
- "How it works" 3-step section below hero
- Feature grid: 4 cards (Model Routing, Persistent Memory,
  Contradiction Detection, Observable Traces)
- All sections animate in on scroll with Framer Motion viewport trigger
- Staggered entrance on hero children

MemoryCard:
- Query text (2-line clamp), date, source/claim/contradiction counts
- Hover lift with Framer Motion spring
- X delete button top-right, optimistic removal from UI
- Click → navigate to /research/{session_id}

## Code Standards
- TypeScript strict mode, no `any` types anywhere
- Pydantic v2 for all backend models
- Functional components only
- Custom hooks for any logic over 20 lines
- React Query for all server state
- Zustand only for active session UI state
- All API calls try/catch with user-friendly Sonner toast on error
- aria-labels on all icon-only buttons
- Mobile-first responsive (must work at 375px)
- Never hardcode keys — always environment variables
- All async FastAPI routes, no sync blocking
- Agent pipeline wrapped in try/except, errors emit into SSE queue

## Deployment Config

backend/Dockerfile:
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  EXPOSE 8000
  CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

frontend/netlify.toml:
  [build]
    command = "npm run build"
    publish = ".next"
  [[plugins]]
    package = "@netlify/plugin-nextjs"

Root netlify.toml (monorepo):
  [build]
    base = "frontend"
    command = "npm run build"
    publish = "frontend/.next"

frontend/.nvmrc: 18
CORS in backend must allow *.netlify.app and the specific Netlify URL.
CHROMA_PERSIST_DIR=/data/chroma on Render (disk mounted at /data).

## README Structure
1. ASCII art LEXIS AI banner
2. One-line description
3. Live demo link placeholder + GitHub badge
4. Mermaid diagram of agent pipeline
5. Tech stack table: Layer | Technology | Why
6. Key Engineering Decisions (model routing, memory, SSE, contradiction
   detection, observability) — written for engineers
7. Local setup in under 6 steps
8. Environment variables table
9. Folder structure

## Interview Talking Points
Include these as comments in relevant files and in README:
- Model routing: cheap models for parsing, powerful for synthesis = cost optimization
- ChromaDB semantic memory = research partner, not just a tool
- Critic agent contradiction detection = trust layer most AI tools skip
- SSE streaming agent thoughts = transparency as a feature
- Langfuse traces = full observability, every decision logged
