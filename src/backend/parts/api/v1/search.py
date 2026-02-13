from db.session import get_session
from fastapi import APIRouter, Depends
from parts.db.models import Part, Vehicle
from parts.schemas.search import SearchResult
from sqlmodel import Session, col, or_, select

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/", response_model=SearchResult)
async def search(q: str, session: Session = Depends(get_session)):
    """
    US-021: Free text search for parts and vehicles
    """
    query = f"%{q}%"

    # Search Parts
    # Note: searching across "all fields" - for simplicity I'll pick the most relevant ones
    # In production, this would use Full Text Search (GIN indexes on jsonb/tsvector)
    parts_statement = select(Part).where(
        or_(
            col(Part.internal_part_code).ilike(query),
            col(Part.oe_part_number).ilike(query),
            col(Part.manufacturer_part_number).ilike(query),
            col(Part.description).ilike(query),
            col(Part.system).ilike(query),
            col(Part.notes).ilike(query),
            col(Part.oe_description).ilike(query),
        )
    )
    parts = session.exec(parts_statement).all()

    # Search Vehicles
    vehicles_statement = select(Vehicle).where(
        or_(
            col(Vehicle.make).ilike(query),
            col(Vehicle.model).ilike(query),
            col(Vehicle.variant).ilike(query),
            col(Vehicle.body_style).ilike(query),
            col(Vehicle.trim_level).ilike(query),
        )
    )
    vehicles = session.exec(vehicles_statement).all()

    return SearchResult(parts=parts, vehicles=vehicles)
