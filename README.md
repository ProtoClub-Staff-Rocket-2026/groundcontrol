# Ground Control

Ground station dashboard for monitoring rocket telemetry and triggering launch. Python FastAPI backend with SQLite, React frontend.

## Project Structure

```
backend/        Python FastAPI REST API (uv)
ui/             React frontend (Vite, npm)
tools/          Development and testing utilities
docker-compose.yml
```

## Development

### Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

Runs on http://localhost:8000

### Frontend

```bash
cd ui
npm install
npm run dev
```

Runs on http://localhost:5173. The Vite dev server proxies `/api` requests to `localhost:8000`.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/events/` | Create a telemetry event (returns 204) |
| GET | `/events/` | Get 50 newest events (optional `?identifier=` filter) |
| GET | `/events/sessions` | List distinct session identifiers |
| GET | `/commands/launch` | Send launch signal to launch pad |

### Example: Post a test event

```bash
curl -X POST http://localhost:8000/events/ \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"t1","identifier":"session1","velocity":12.4,"air_pressure":100.2}'
```

## Tools

### simulate.py

Simulates a rocket launch by sending telemetry events to the backend every 0.5s. Velocity ramps up and air pressure drops as altitude increases.

```bash
python tools/simulate.py
```

Requires the backend to be running. Set the air pressure reference to `1013.25` in the UI settings to see altitude calculations.

## Production

```bash
docker compose up --build
```

- UI served on port **80** (nginx)
- Backend on port **8000** (uvicorn)
- SQLite data persisted in a Docker volume

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LAUNCH_PAD_URL` | `http://localhost:9000/launch` | URL to send launch command to |

```bash
LAUNCH_PAD_URL=http://your-launch-pad/launch docker compose up --build
```

## License

MIT
