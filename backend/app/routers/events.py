from fastapi import APIRouter, Depends, Response
from sqlmodel import Session, select

from app.database import get_session
from app.models import DataEvent, DataEventCreate, DataEventRead

router = APIRouter()


@router.post("/events/", status_code=204)
def create_event(event: DataEventCreate, session: Session = Depends(get_session)):
    db_event = DataEvent.model_validate(event)
    session.add(db_event)
    session.commit()
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
