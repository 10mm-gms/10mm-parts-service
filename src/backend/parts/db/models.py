from uuid import UUID, uuid4

from sqlmodel import JSON, Field, Relationship, SQLModel


class PartVehicleLink(SQLModel, table=True):
    part_id: UUID = Field(foreign_key="part.id", primary_key=True)
    vehicle_id: UUID = Field(foreign_key="vehicle.id", primary_key=True)


class StockLevel(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    part_id: UUID = Field(foreign_key="part.id")
    location_id: UUID = Field(foreign_key="location.id")
    quantity: int = Field(default=0)

    part: "Part" = Relationship(back_populates="stock_levels")
    location: "Location" = Relationship(back_populates="stock_levels")


class Location(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    address: str
    notes: str | None = None
    telephone: str | None = None
    email: str | None = None

    stock_levels: list[StockLevel] = Relationship(back_populates="location")


class Vehicle(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    make: str = Field(index=True)
    model: str = Field(index=True)
    from_year: int
    to_year: int | None = None
    power_type: str  # MHEV, PHEV, EV
    variant: str | None = None
    body_style: str  # Hatchback, Saloon, etc.
    drive_type: str  # FWD, RWD, AWD
    trim_level: str | None = None

    parts: list["Part"] = Relationship(back_populates="vehicles", link_model=PartVehicleLink)


class Part(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    internal_part_code: str | None = Field(default=None, unique=True, index=True)
    oe_part_number: str | None = Field(default=None, index=True)
    manufacturer_part_number: str = Field(index=True)
    description: str
    part_type: str = Field(index=True)  # Added for code generation
    system: str  # Powertrain, Transmission, etc.
    last_known_price: float | None = None
    last_known_supplier: str | None = None
    purchase_url: str | None = None
    notes: str | None = None
    image_url: str | None = None
    oe_description: str | None = None
    availability: str = Field(default="Available")  # Available, Backordered, Discontinued
    alternatives: list[UUID] = Field(default_factory=list, sa_type=JSON)

    stock_levels: list[StockLevel] = Relationship(back_populates="part")
    vehicles: list[Vehicle] = Relationship(back_populates="parts", link_model=PartVehicleLink)
