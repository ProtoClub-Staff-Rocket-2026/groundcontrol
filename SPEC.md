# Specs for the Ground controller software

This repo contains two separate applications in their own directories. One is web UI and the other is a REST API that is used by the UI.

The infrastructure is handled via Docker Compose. The backend accepts calls from the local UI and from outside aswell.

## UI

Locates in the `ui`-directory.

Only one view: the dashboard for displaying data from the backend `/events`-route. The dashboard shows data from one session at a time, with a dropdown to switch between sessions. The latest session is selected by default.

A settings modal that has a field for setting the reference value for the air pressure field (calibration purposes, UI only).

### Tech stack

- Vite
- React (Javascript)
- npm

## Backend

REST API locates in the `backend`-directory.

Use `uv` as package manager and script runner.

### Tech stack

- Python
- FastAPI
- SQLModel
- SQLite

### Resources

- DataEvent

### Endpoints

- POST `/events/`

Creates a new data event sent by the satellite.

```json
{
    "timestamp": "some-timestamp-from-the-satellite",
    "identifier": "a-unique-string-related-to-this-session-from-satellite",
    "velocity": 12.4,
    "air_pressure": 100.2
}
```

Doesn't return anything (the caller is long gone).

- GET `/events/?identifier=<session>`

Returns the events. Defaults to 50 newest values. Optionally filtered by session `identifier`.

- GET `/events/sessions`

Returns a list of distinct session identifiers, ordered by most recent first.

```json
["session-abc", "session-def"]
```

#### Unfiltered: GET `/events/`

Returns the 50 newest events across all sessions.

```json
[
    {
        "id": 1,
        "timestamp": "some-timestamp-from-the-satellite",
        "identifier": "a-unique-string-related-to-this-session-from-satellite",
        "velocity": 12.4,
        "air_pressure": 100.2,
        "save_datetime": "the server datetime"
    }
]
```

- GET `/commands/launch`

This endpoint sends the launch triggering signal to the launch pad.

Expects the return status code 200 (from the launch pad) with no message (could have one) or a status code 400 with content:

```json
{
    "message": "failure reason"
}
```

Returns the message or status code received.
