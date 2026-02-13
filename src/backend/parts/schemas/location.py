from uuid import UUID

from pydantic import BaseModel


class LocationBase(BaseModel):
    name: str
    address: str
    notes: str | None = None
    telephone: str | None = None
    email: str | None = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    notes: str | None = None
    telephone: str | None = None
    email: str | None = None


class LocationRead(LocationBase):
    id: UUID

    class Config:
        from_attributes = True
