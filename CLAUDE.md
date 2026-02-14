# Ground Control - Claude Code Guide

## Project Overview

Rocket ground station dashboard: FastAPI backend + React frontend + Docker Compose.

## Tech Stack

- **Backend**: Python, FastAPI, SQLModel, SQLite, uv (package manager)
- **Frontend**: React (JSX), Vite, npm
- **Production**: Docker Compose, nginx reverse proxy

## Commands

### Backend
```bash
cd backend
uv sync                                    # install deps
uv run uvicorn app.main:app --reload       # dev server on :8000
```

### Frontend
```bash
cd ui
npm install                                # install deps
npm run dev                                # dev server on :5173
```

### Production
```bash
docker compose up --build                  # UI on :80, backend on :8000
```

## Architecture

- Backend routes have NO `/api` prefix — the proxy layer (Vite dev / nginx prod) strips `/api` before forwarding
- Frontend polls `GET /events/` every 2 seconds
- `POST /events/` returns 204 (no body)
- `GET /commands/launch` proxies to external `LAUNCH_PAD_URL` via httpx
- SQLite database file: `backend/data.db` (auto-created on startup)
- Air pressure reference value stored in browser localStorage, used for barometric altitude calculation

## Key Files

- `backend/app/main.py` — FastAPI app, CORS, lifespan (table creation)
- `backend/app/models.py` — DataEvent SQLModel
- `backend/app/routers/events.py` — POST/GET /events/
- `backend/app/routers/commands.py` — GET /commands/launch
- `backend/app/config.py` — LAUNCH_PAD_URL env var
- `ui/src/App.jsx` — root component, settings state
- `ui/src/components/Dashboard.jsx` — event table + polling
- `ui/src/components/SettingsModal.jsx` — air pressure reference input
- `ui/src/components/LaunchButton.jsx` — launch with confirmation
- `ui/vite.config.js` — dev proxy config
- `ui/nginx.conf` — production proxy config
