from uuid import UUID

from pydantic import BaseModel


class VehicleBase(BaseModel):
    make: str
    model: str
    from_year: int
    to_year: int | None = None
    power_type: str  # MHEV, PHEV, EV
    variant: str | None = None
    body_style: str  # Hatchback, Saloon, etc.
    drive_type: str  # FWD, RWD, AWD
    trim_level: str | None = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    make: str | None = None
    model: str | None = None
    from_year: int | None = None
    to_year: int | None = None
    power_type: str | None = None
    variant: str | None = None
    body_style: str | None = None
    drive_type: str | None = None
    trim_level: str | None = None


class VehicleRead(VehicleBase):
    id: UUID

    class Config:
        from_attributes = True
