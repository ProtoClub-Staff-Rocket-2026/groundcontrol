import json
from collections import defaultdict

from fastapi import APIRouter, Depends, Response, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select

from app.database import get_session
from app.models import DataEvent, DataEventCreate, DataEventRead

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, identifier: str, ws: WebSocket):
        await ws.accept()
        self._connections[identifier].append(ws)

    def disconnect(self, identifier: str, ws: WebSocket):
        self._connections[identifier].remove(ws)
        if not self._connections[identifier]:
            del self._connections[identifier]

    async def broadcast(self, identifier: str, data: dict):
        message = json.dumps(data)
        for ws in list(self._connections.get(identifier, [])):
            try:
                await ws.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()


@router.post("/events/", status_code=204)
async def create_event(event: DataEventCreate, session: Session = Depends(get_session)):
    db_event = DataEvent.model_validate(event)
    session.add(db_event)
    session.commit()
    session.refresh(db_event)

    event_data = DataEventRead.model_validate(db_event).model_dump(mode="json")
    await manager.broadcast(db_event.identifier, {"type": "event", "data": event_data})

    return Response(status_code=204)


@router.get("/events/", response_model=list[DataEventRead])
def get_events(
    identifier: str | None = None,
    session: Session = Depends(get_session),
):
    statement = select(DataEvent)
    if identifier:
        statement = statement.where(DataEvent.identifier == identifier)
    statement = statement.order_by(DataEvent.save_datetime.desc()).limit(50)
    return session.exec(statement).all()


@router.get("/events/sessions", response_model=list[str])
def get_sessions(session: Session = Depends(get_session)):
    statement = (
        select(DataEvent.identifier)
        .distinct()
        .order_by(DataEvent.save_datetime.desc())
    )
    return session.exec(statement).all()


@router.websocket("/ws/events")
async def websocket_events(ws: WebSocket, identifier: str):
    from app.database import engine

    # Send initial batch of events
    with Session(engine) as session:
        statement = (
            select(DataEvent)
            .where(DataEvent.identifier == identifier)
            .order_by(DataEvent.save_datetime.desc())
            .limit(50)
        )
        events = session.exec(statement).all()
        initial = [DataEventRead.model_validate(e).model_dump(mode="json") for e in events]

    await manager.connect(identifier, ws)
    try:
        await ws.send_text(json.dumps({"type": "initial", "data": initial}))
        # Keep connection alive, listen for client messages (ping/pong handled by protocol)
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(identifier, ws)
