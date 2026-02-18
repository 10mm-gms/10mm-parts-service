from uuid import UUID

from core.security import get_current_user
from db.session import get_session
from fastapi import APIRouter, Depends, HTTPException, status
from parts.core.logic import generate_internal_part_code
from parts.db.models import Part, StockLevel, Vehicle
from parts.schemas.part import PartCreate, PartRead, PartUpdate
from parts.schemas.stock import StockLevelCreate, StockLevelRead
from parts.schemas.vehicle import VehicleRead
from sqlalchemy.orm import selectinload
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(prefix="/parts", tags=["Parts"])


@router.post("/", response_model=PartRead, status_code=status.HTTP_201_CREATED)
async def create_part(
    part_in: PartCreate, session: AsyncSession = Depends(get_session), _=Depends(get_current_user)
):
    """
    REQ-PARTS-001: Create a new part (US-001)
    """
    statement = select(func.count()).select_from(Part)
    result = await session.exec(statement)
    count = result.one()

    internal_code = generate_internal_part_code(
        manufacturer=part_in.last_known_supplier or "UNK",
        system=part_in.system,
        part_type=part_in.part_type,
        sequence=count + 1,
    )

    db_part = Part.model_validate(part_in)
    db_part.internal_part_code = internal_code

    session.add(db_part)
    await session.commit()
    await session.refresh(db_part)
    return db_part


@router.get("/", response_model=list[PartRead])
async def list_parts(session: AsyncSession = Depends(get_session)):
    """
    REQ-PARTS-004: View all parts (US-004)
    """
    result = await session.exec(select(Part))
    parts = result.all()
    return parts


@router.get("/{part_id}", response_model=PartRead)
async def get_part(part_id: UUID, session: AsyncSession = Depends(get_session)):
    """
    REQ-PARTS-005: View a single part (US-005)
    """
    part = await session.get(Part, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part


@router.patch("/{part_id}", response_model=PartRead)
async def update_part(
    part_id: UUID,
    part_in: PartUpdate,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_current_user),
):
    """
    REQ-PARTS-002: Edit an existing part (US-002)
    """
    db_part = await session.get(Part, part_id)
    if not db_part:
        raise HTTPException(status_code=404, detail="Part not found")

    update_data = part_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_part, key, value)

    session.add(db_part)
    await session.commit()
    await session.refresh(db_part)
    return db_part


@router.delete("/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_part(
    part_id: UUID, session: AsyncSession = Depends(get_session), _=Depends(get_current_user)
):
    """
    REQ-PARTS-003: Delete an existing part (US-003)
    """
    db_part = await session.get(Part, part_id)
    if not db_part:
        raise HTTPException(status_code=404, detail="Part not found")

    await session.delete(db_part)
    await session.commit()
    return None


@router.post("/{part_id}/vehicles/{vehicle_id}", status_code=status.HTTP_201_CREATED)
async def link_part_to_vehicle(
    part_id: UUID,
    vehicle_id: UUID,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_current_user),
):
    """
    US-011: Link a part to a vehicle
    """
    # Use select with selectinload to avoid lazy-loading issues in async
    statement = select(Part).where(Part.id == part_id).options(selectinload(Part.vehicles))
    result = await session.exec(statement)
    part = result.first()

    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    vehicle = await session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle in part.vehicles:
        return {"message": "Already linked"}

    part.vehicles.append(vehicle)
    session.add(part)
    await session.commit()
    return {"message": "Linked successfully"}


@router.delete("/{part_id}/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unlink_part_from_vehicle(
    part_id: UUID,
    vehicle_id: UUID,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_current_user),
):
    """
    US-012: Unlink a part from a vehicle
    """
    # Use select with selectinload
    statement = select(Part).where(Part.id == part_id).options(selectinload(Part.vehicles))
    result = await session.exec(statement)
    part = result.first()

    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    vehicle = await session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle not in part.vehicles:
        raise HTTPException(status_code=404, detail="Link not found")

    part.vehicles.remove(vehicle)
    session.add(part)
    await session.commit()
    return None


@router.get("/{part_id}/vehicles", response_model=list[VehicleRead])
async def list_vehicles_for_part(part_id: UUID, session: AsyncSession = Depends(get_session)):
    """
    US-014: View all vehicles linked to a part
    """
    # Use select with selectinload
    statement = select(Part).where(Part.id == part_id).options(selectinload(Part.vehicles))
    result = await session.exec(statement)
    part = result.first()

    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part.vehicles


@router.get("/{part_id}/stock", response_model=list[StockLevelRead])
async def list_stock_for_part(part_id: UUID, session: AsyncSession = Depends(get_session)):
    """
    US-020: Read stock levels for a part
    """
    # Use select with selectinload
    statement = select(Part).where(Part.id == part_id).options(selectinload(Part.stock_levels))
    result = await session.exec(statement)
    part = result.first()

    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part.stock_levels


@router.post("/{part_id}/stock", response_model=StockLevelRead)
async def set_stock_for_part(
    part_id: UUID, stock_in: StockLevelCreate, session: AsyncSession = Depends(get_session)
):
    """
    US-020: Set or update stock level for a part at a location
    """
    part = await session.get(Part, part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    statement = select(StockLevel).where(
        StockLevel.part_id == part_id, StockLevel.location_id == stock_in.location_id
    )
    result = await session.exec(statement)
    db_stock = result.first()

    if db_stock:
        db_stock.quantity = stock_in.quantity
    else:
        db_stock = StockLevel(
            part_id=part_id, location_id=stock_in.location_id, quantity=stock_in.quantity
        )
        session.add(db_stock)

    await session.commit()
    await session.refresh(db_stock)
    return db_stock
