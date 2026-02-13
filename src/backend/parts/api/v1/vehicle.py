from uuid import UUID

from core.security import get_current_user
from db.session import get_session
from fastapi import APIRouter, Depends, HTTPException, status
from parts.db.models import Vehicle
from parts.schemas.part import PartRead
from parts.schemas.vehicle import VehicleCreate, VehicleRead, VehicleUpdate
from sqlmodel import Session, select

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.post("/", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_in: VehicleCreate, session: Session = Depends(get_session), _=Depends(get_current_user)
):
    """
    REQ-VEH-001: Create a new vehicle (US-006)
    """
    db_vehicle = Vehicle.model_validate(vehicle_in)
    session.add(db_vehicle)
    session.commit()
    session.refresh(db_vehicle)
    return db_vehicle


@router.get("/", response_model=list[VehicleRead])
async def list_vehicles(session: Session = Depends(get_session)):
    """
    US-009: View all vehicles
    """
    vehicles = session.exec(select(Vehicle)).all()
    return vehicles


@router.get("/{vehicle_id}", response_model=VehicleRead)
async def get_vehicle(vehicle_id: UUID, session: Session = Depends(get_session)):
    """
    US-010: View a single vehicle
    """
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleRead)
async def update_vehicle(
    vehicle_id: UUID,
    vehicle_in: VehicleUpdate,
    session: Session = Depends(get_session),
    _=Depends(get_current_user),
):
    """
    US-007: Edit an existing vehicle
    """
    db_vehicle = session.get(Vehicle, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    update_data = vehicle_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vehicle, key, value)

    session.add(db_vehicle)
    session.commit()
    session.refresh(db_vehicle)
    return db_vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: UUID, session: Session = Depends(get_session), _=Depends(get_current_user)
):
    """
    US-008: Delete an existing vehicle
    """
    db_vehicle = session.get(Vehicle, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    session.delete(db_vehicle)
    session.commit()
    return None


@router.get("/{vehicle_id}/parts", response_model=list[PartRead])
async def list_parts_for_vehicle(vehicle_id: UUID, session: Session = Depends(get_session)):
    """
    US-013: View all parts linked to a vehicle
    """
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle.parts
