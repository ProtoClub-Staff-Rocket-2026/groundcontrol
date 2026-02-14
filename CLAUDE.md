# Ground Control - Claude Code Guide

## Project Overview

Rocket ground station dashboard: FastAPI backend + React frontend + Docker Compose.

## Tech Stack

- **Backend**: Python, FastAPI, SQLModel, SQLite, uv (package manager)
- **Frontend**: React (JSX), Vite, Recharts, npm
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
- Frontend connects to `WS /ws/events?identifier=` for real-time telemetry; server sends initial 50 events on connect, then pushes new events as they arrive
- `POST /events/` returns 204 (no body) and broadcasts the new event to subscribed WebSocket clients via `ConnectionManager`
- `GET /events/sessions` returns distinct identifiers; frontend polls this every 5 seconds
- `GET /events/` REST endpoint kept as fallback
- Dashboard auto-selects the latest session, with a dropdown to switch; shows WebSocket connection status (LIVE/CONNECTING/OFFLINE) and time since last update
- WebSocket auto-reconnects on disconnect with 2s delay
- `GET /commands/launch` proxies to external `LAUNCH_PAD_URL` via httpx
- SQLite database file: `backend/data.db` (auto-created on startup)
- Air pressure reference value stored in browser localStorage, used for barometric altitude calculation
- Vite dev proxy: `/api/ws` with `ws: true` (before `/api`); nginx: `/api/ws/` location with upgrade headers (before `/api/`)

## UI Design

- Mission control aesthetic: dark navy-black palette, scanline texture background
- Fonts: IBM Plex Mono (data/body), Chakra Petch (headings/labels) via Google Fonts
- Charts: Recharts area charts with gradient fills, live latest value in chart header
- Launch button opens a confirmation modal (not window.confirm)
- CSS custom properties in :root for all colors/fonts

## Tools

- `tools/simulate.py` — simulates a rocket launch, sends telemetry events every 0.5s (requires backend running)

## Key Files

- `backend/app/main.py` — FastAPI app, CORS, lifespan (table creation)
- `backend/app/models.py` — DataEvent SQLModel
- `backend/app/routers/events.py` — POST/GET /events/, GET /events/sessions, WS /ws/events (ConnectionManager for broadcasts)
- `backend/app/routers/commands.py` — GET /commands/launch
- `backend/app/config.py` — LAUNCH_PAD_URL env var
- `ui/src/App.jsx` — root component, settings state
- `ui/src/components/Dashboard.jsx` — telemetry charts + event table + WebSocket connection
- `ui/src/components/SettingsModal.jsx` — air pressure reference input
- `ui/src/components/LaunchButton.jsx` — launch with confirmation modal
- `ui/vite.config.js` — dev proxy config
- `ui/nginx.conf` — production proxy config
