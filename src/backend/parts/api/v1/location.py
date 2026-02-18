from uuid import UUID

from core.security import get_current_user
from db.session import get_session
from fastapi import APIRouter, Depends, HTTPException, status
from parts.db.models import Location
from parts.schemas.location import LocationCreate, LocationRead, LocationUpdate
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.post("/", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
async def create_location(
    location_in: LocationCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_current_user),
):
    """
    US-015: Create a new location
    """
    db_location = Location.model_validate(location_in)
    session.add(db_location)
    await session.commit()
    await session.refresh(db_location)
    return db_location


@router.get("/", response_model=list[LocationRead])
async def list_locations(session: AsyncSession = Depends(get_session)):
    """
    US-018: View all locations
    """
    result = await session.exec(select(Location))
    locations = result.all()
    return locations


@router.get("/{location_id}", response_model=LocationRead)
async def get_location(location_id: UUID, session: AsyncSession = Depends(get_session)):
    """
    US-019: View a single location
    """
    location = await session.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


@router.patch("/{location_id}", response_model=LocationRead)
async def update_location(
    location_id: UUID,
    location_in: LocationUpdate,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_current_user),
):
    """
    US-016: Edit an existing location
    """
    db_location = await session.get(Location, location_id)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")

    update_data = location_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_location, key, value)

    session.add(db_location)
    await session.commit()
    await session.refresh(db_location)
    return db_location


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: UUID, session: AsyncSession = Depends(get_session), _=Depends(get_current_user)
):
    """
    US-017: Delete an existing location
    """
    db_location = await session.get(Location, location_id)
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")

    await session.delete(db_location)
    await session.commit()
    return None
