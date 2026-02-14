from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


class DataEventBase(SQLModel):
    timestamp: str
    identifier: str
    velocity: float
    air_pressure: float


class DataEvent(DataEventBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    save_datetime: datetime = Field(default_factory=lambda: datetime.now(UTC))


class DataEventCreate(DataEventBase):
    pass


class DataEventRead(DataEventBase):
    id: int
    save_datetime: datetime
