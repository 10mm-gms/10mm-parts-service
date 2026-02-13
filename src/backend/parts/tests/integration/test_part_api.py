import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_part(client: AsyncClient):
    payload = {
        "manufacturer_part_number": "SU-123",
        "description": "Suspension Bushing",
        "part_type": "Bushing",
        "system": "Suspension",
        "last_known_supplier": "Toyota",
        "availability": "Available",
    }
    response = await client.post("/api/v1/parts/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["manufacturer_part_number"] == "SU-123"
    assert "internal_part_code" in data
    # Normalised should be TOY-SUS-BUS-00001
    assert data["internal_part_code"] == "TOY-SUS-BUS-00001"


@pytest.mark.asyncio
async def test_list_parts(client: AsyncClient):
    # Create one first
    await client.post(
        "/api/v1/parts/",
        json={
            "manufacturer_part_number": "PN1",
            "description": "Desc1",
            "part_type": "Type1",
            "system": "Sys1",
            "last_known_supplier": "Mfg1",
        },
    )

    response = await client.get("/api/v1/parts/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_update_part(client: AsyncClient):
    # Create one first
    create_resp = await client.post(
        "/api/v1/parts/",
        json={
            "manufacturer_part_number": "UP-1",
            "description": "Old Desc",
            "part_type": "Type",
            "system": "Sys",
        },
    )
    part_id = create_resp.json()["id"]

    # Update it
    update_resp = await client.patch(
        f"/api/v1/parts/{part_id}", json={"description": "New Desc", "last_known_price": 99.99}
    )

    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["description"] == "New Desc"
    assert data["last_known_price"] == 99.99


@pytest.mark.asyncio
async def test_delete_part(client: AsyncClient):
    # Create one first
    create_resp = await client.post(
        "/api/v1/parts/",
        json={
            "manufacturer_part_number": "DEL-1",
            "description": "To Delete",
            "part_type": "Type",
            "system": "Sys",
        },
    )
    part_id = create_resp.json()["id"]

    # Delete it
    delete_resp = await client.delete(f"/api/v1/parts/{part_id}")
    assert delete_resp.status_code == 204

    # Verify it's gone
    get_resp = await client.get(f"/api/v1/parts/{part_id}")
    assert get_resp.status_code == 404
