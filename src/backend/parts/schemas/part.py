from uuid import UUID

from pydantic import BaseModel


class PartBase(BaseModel):
    manufacturer_part_number: str
    description: str
    part_type: str  # Added for code generation
    system: str
    oe_part_number: str | None = None
    last_known_price: float | None = None
    last_known_supplier: str | None = None
    purchase_url: str | None = None
    notes: str | None = None
    image_url: str | None = None
    oe_description: str | None = None
    availability: str = "Available"
    alternatives: list[UUID] = []


class PartCreate(PartBase):
    pass


class PartUpdate(BaseModel):
    manufacturer_part_number: str | None = None
    description: str | None = None
    part_type: str | None = None
    system: str | None = None
    oe_part_number: str | None = None
    last_known_price: float | None = None
    last_known_supplier: str | None = None
    purchase_url: str | None = None
    notes: str | None = None
    image_url: str | None = None
    oe_description: str | None = None
    availability: str | None = None
    alternatives: list[UUID] | None = None


class PartRead(PartBase):
    id: UUID
    internal_part_code: str

    class Config:
        from_attributes = True
