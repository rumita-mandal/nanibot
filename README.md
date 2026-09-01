# NaniBot — The Wisdom We Inherited 🌿

> **A digital archive of intergenerational household wisdom with evidence-aware AI.**

NaniBot preserves traditional household knowledge passed from grandmothers and mothers — cooking hacks, cleaning tricks, home practices, and traditional remedies — presented responsibly with clear evidence labels.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Python 3.11 + FastAPI + SQLAlchemy |
| LLM | Google Gemini 2.0 Flash (free tier) |
| RAG | LangChain + ChromaDB |
| Embeddings | `sentence-transformers` (local, free) |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose) + bcrypt |
| Containerization | Docker + Docker Compose |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/) (for local frontend dev)
- [Python 3.11+](https://www.python.org/) + [uv](https://docs.astral.sh/uv/) (for local backend dev)
- A free **Google Gemini API key** → [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

## Quick Start (Docker)

### 1. Clone & Configure

```bash
git clone https://github.com/yourname/nanibot.git
cd nanibot
cp .env.example .env
```

Edit `.env` and set:
```
GEMINI_API_KEY=your_free_gemini_api_key
SECRET_KEY=your_random_secret_string
ADMIN_PASSWORD=your_admin_password
```

### 2. Start Everything

```bash
docker-compose up --build
```

This starts:
- **PostgreSQL** on port `5432`
- **FastAPI backend** on port `8000`
- **Next.js frontend** on port `3000`

The database is auto-migrated and seed data is loaded on first start.

### 3. Visit the App

| Service | URL |
|---------|-----|
| 🌿 NaniBot App | http://localhost:3000 |
| 📚 API Docs | http://localhost:8000/docs |
| 🔧 Admin Dashboard | http://localhost:3000/admin |

**Default admin credentials:** see your `.env` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`

---

## Local Development (without Docker)

### Backend

```bash
cd backend

# Install uv if not present
pip install uv

# Install dependencies
uv sync

# Set up .env (copy from root)
cp ../.env.example .env

# Run database migrations (needs local PostgreSQL)
uv run alembic upgrade head

# Seed knowledge data
uv run python -m app.data.seed

# Start backend
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## Project Structure

```
nanibot/
├── frontend/          # Next.js 14 app
│   ├── src/app/       # App Router pages
│   ├── src/components/# Reusable UI components
│   └── src/lib/       # API client, hooks, utilities
│
├── backend/
│   ├── app/
│   │   ├── api/       # FastAPI route handlers
│   │   ├── core/      # Config, DB, auth, dependencies
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic request/response models
│   │   ├── services/  # RAG, LLM, embeddings, safety
│   │   └── data/      # Seed knowledge data
│   ├── tests/         # Pytest test suite
│   └── alembic/       # Database migrations
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Features

- 🤖 **AI Chatbot** — RAG-powered conversational assistant
- 🌿 **50+ Traditional Wisdom Entries** — curated seed knowledge
- 🏷️ **Evidence Labels** — 🟢 Well Supported / 🟡 Some Evidence / 🟠 Limited Evidence / 🔴 Potentially Unsafe
- 🛡️ **Safety Layer** — detects high-risk symptoms and escalates to professional care
- 🗂️ **Category Browser** — 8 categories with semantic search
- 📝 **User Contributions** — submit your family's wisdom
- 📔 **Family Archive** — private "Nani's Notebook" with audio recording
- 🗺️ **Regional Wisdom** — explore traditions by Indian region
- 🎙️ **Voice Input** — speak your question, hear the answer
- 🌍 **Multilingual** — EN / HI / BN / TA / TE / MR
- 🔐 **Authentication** — JWT-based email/password auth
- 🛠️ **Admin Dashboard** — moderation, analytics, content management

---

## API Documentation

Interactive API docs at: http://localhost:8000/docs

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login → JWT |
| `POST` | `/api/chat/message` | Send chat message (RAG) |
| `GET`  | `/api/wisdom` | List wisdom entries |
| `POST` | `/api/contribute` | Submit new wisdom |
| `GET`  | `/api/search?q=...` | Semantic search |
| `GET`  | `/api/admin/stats` | Admin dashboard stats |

---

## Environment Variables

See [.env.example](.env.example) for full list.

**Required:**
- `GEMINI_API_KEY` — free from [aistudio.google.com](https://aistudio.google.com/app/apikey)
- `SECRET_KEY` — random string for JWT signing
- `POSTGRES_PASSWORD` — database password

---

## Running Tests

```bash
cd backend
uv run pytest tests/ -v
```

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Set `NEXT_PUBLIC_API_URL` to your backend URL in Vercel dashboard.

### Backend → Render / Railway

1. Push to GitHub
2. Connect repo to [Render](https://render.com) or [Railway](https://railway.app)
3. Set all env vars from `.env.example`
4. Deploy `backend/` directory with start command:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

---

## Important Disclaimer

NaniBot is a **cultural knowledge archive**, not a medical advice platform. Traditional wisdom is presented as cultural heritage with clear evidence labels. Always consult a qualified healthcare professional for medical concerns.

---

## License

MIT License — feel free to build on this!

---

*"The wisdom that was never written down."* 🌿
