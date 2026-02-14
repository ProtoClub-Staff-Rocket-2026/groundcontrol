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
def get_events(session: Session = Depends(get_session)):
    statement = select(DataEvent).order_by(DataEvent.save_datetime.desc()).limit(50)
    return session.exec(statement).all()
