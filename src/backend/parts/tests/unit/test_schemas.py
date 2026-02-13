import pytest
from parts.schemas.part import PartCreate
from pydantic import ValidationError


def test_part_schema_validation():
    # Valid payload
    valid_payload = {
        "manufacturer_part_number": "MPN-123",
        "description": "Standard Test Part",
        "part_type": "Bushing",
        "system": "Suspension",
    }
    part = PartCreate(**valid_payload)
    assert part.manufacturer_part_number == "MPN-123"

    # Missing mandatory field
    invalid_payload = {"description": "Missing MPN", "part_type": "Bushing", "system": "Suspension"}
    with pytest.raises(ValidationError):
        PartCreate(**invalid_payload)


def test_part_schema_utf8_resilience():
    # REQ-PARTS-UTF8: Character set robustness
    utf8_payload = {
        "manufacturer_part_number": "MPN-É-123",
        "description": "Special characters: é, à, ©, ®, - ' \"",
        "part_type": "Type-Ω",
        "system": "Système",
    }
    part = PartCreate(**utf8_payload)
    assert "é" in part.description
    assert "Ω" in part.part_type
    assert "è" in part.system
