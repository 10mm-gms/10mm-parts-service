from uuid import UUID

from pydantic import BaseModel


class StockLevelBase(BaseModel):
    quantity: int = 0


class StockLevelCreate(StockLevelBase):
    location_id: UUID


class StockLevelUpdate(StockLevelBase):
    pass


class StockLevelRead(StockLevelBase):
    id: UUID
    part_id: UUID
    location_id: UUID

    class Config:
        from_attributes = True
