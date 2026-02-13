from parts.schemas.part import PartRead
from parts.schemas.vehicle import VehicleRead
from pydantic import BaseModel


class SearchResult(BaseModel):
    parts: list[PartRead]
    vehicles: list[VehicleRead]
