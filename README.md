# LEXIS AI — Project Intelligence

## What This Project Is
A **production‑grade multi‑agent AI research analyst**. Users enter any research question, and Lexis autonomously plans sub‑questions, searches the web, reads sources, synthesizes findings with confidence scores, detects contradictions between sources, stores everything in a persistent vector memory, and delivers a structured cited report—all streamed live so you watch the agent think.

Built as a portfolio project targeting **AI Engineering / AI Orchestration** roles. Every technical decision is intentional and explainable in interviews.

---

## Quick start (local development)

```bash
# Clone the repo (already done)
# -------------------------------------------------
# Frontend
cd frontend
npm install
# Set API URL – the backend runs on port 8000 by default
cp .env.local.example .env.local   # edit if needed (NEXT_PUBLIC_API_URL)
npm run dev   # http://localhost:3000

# Backend (in a separate terminal)
cd ../backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Edit .env and replace the placeholder keys with your real values
cp .env.example .env   # then fill in OPENROUTER_API_KEY and TAVILY_API_KEY
uvicorn backend.main:app --reload   # http://localhost:8000
```

Both services should start without errors. The UI can be used to start a research session, stream the agent thoughts, and view the final report.

---

## Deployment

- **Frontend** – Deploy on Netlify (see `frontend/netlify.toml`).
- **Backend** – Deploy on Render, Railway, Fly.io, or any Docker host. The provided `backend/Dockerfile` builds a minimal container.
- **Environment variables** in production **must** be set via your host’s secret/environment configuration (no hard‑coded keys).

---

## Technical Decisions
- **Model Routing** – Cheap Gemini flash for planning/searches; powerful Sonnet for synthesis/critique/report.
- **Persistent Memory** – ChromaDB stores research sessions as semantic embeddings.
- **Contradiction Detection** – Dedicated Critic agent surfaces conflicting claims with explanations.
- **Observable Traces** – Every pipeline step emits an `AgentThought` event for live SSE streaming.
- **Observability** – Langfuse traces each pipeline execution (optional but wired.

---

## Design System
A dark editorial intelligence‑tool aesthetic. Think Bloomberg Terminal meets Linear. NOT purple gradients.  

- Background primary: `#0a0a0a`  
- Background surface: `#111111`  
- Accent green: `#00ff88` (agent activity)  
- Accent blue: `#4488ff` (links)  
- Accent amber: `#ffaa00` (warnings)  
- Accent red: `#ff4444` (errors)  

All colors are defined as CSS custom properties. Dark mode only, with subtle dot‑grid background.

---

## Local Setup (< 6 steps)

1. Clone repo.  
2. Frontend: `npm install` → `npm run dev`.  
3. Backend: create venv → `pip install -r requirements.txt`.  
4. Fill `.env` (backend) and `.env.local` (frontend) with your API keys.  
5. Run backend with `uvicorn backend.main:app --reload`.  
6. Open `http://localhost:3000` – start research, watch agent stream, view report.

---

## Environment Variables

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `OPENROUTER_API_KEY` | Authentication token for OpenRouter | `sk‑or‑v1‑…` |
| `TAVILY_API_KEY` | API key for Tavily search | `tvly‑dev‑…` |
| `LANGFUSE_PUBLIC_KEY` | Langfuse public key (optional) | – |
| `LANGFUSE_SECRET_KEY` | Langfuse secret key (optional) | – |
| `LANGFUSE_HOST` | Langfuse host | `https://cloud.langfuse.com` |
| `CHROMA_PERSIST_DIR` | Path to ChromaDB data storage | `./chroma_data` (dev) → `/data/chroma` (Render) |
| `FRONTEND_URL` | URL of frontend dev server | `http://localhost:3000` |

All keys are loaded via `python‑dotenv` in `backend/config.py` and via `import.meta.env` in the Next.js app.

---

## Folder Structure

```
/
├─ frontend/            # Next.js 14 App Router
│   ├─ app/            # pages & layout
│   ├─ components/     # UI widgets (shadcn/ui)
│   ├─ lib/            # API client, types, Zustand store
│   └─ next.config.js # Tailwind + plugins config
├─ backend/             # FastAPI service
│   ├─ agents/         # planner, searcher, synthesizer, critic, reporter, orchestrator
│   ├─ services/       # OpenRouter, Chroma, embeddings, Langfuse stub
│   ├─ models/         # Pydantic v2 models (research.py)
│   ├─ routers/        # API endpoints (research, memory, health)
│   └─ main.py         # FastAPI app bootstrap
├─ netlify.toml         # Netlify build config (pointing to frontend)
└─ README.md
```

---

## License

MIT – feel free to fork, extend, and use it in your own projects.

---

## Interview Talking Points
- **Model routing** – cost‑optimized selection of Gemini vs. Sonnet models.  
- **Chroma memory** – research partner, not just a cache.  
- **Contradiction detection** – trust layer missing in most AI tools.  
- **SSE streaming** – transparency as a feature.  
- **Langfuse traces** – full observability for every decision.  

--- 
