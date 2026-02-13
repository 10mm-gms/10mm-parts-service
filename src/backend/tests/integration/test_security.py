import pytest
from httpx import ASGITransport, AsyncClient
from main import app


@pytest.mark.asyncio
async def test_unauthorized_part_creation_fails():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "manufacturer_part_number": "SEC-TEST-001",
            "description": "Security Test Part",
            "part_type": "Other",
            "system": "Other",
            "availability": "Available"
        }
        response = await client.post("/api/v1/parts/", json=payload)
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

@pytest.mark.asyncio
async def test_unauthorized_part_update_fails():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        url = "/api/v1/parts/00000000-0000-0000-0000-000000000000"
        response = await client.patch(url, json={"description": "hack"})
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_unauthorized_part_deletion_fails():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.delete("/api/v1/parts/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_authorized_part_creation_succeeds(client: AsyncClient):
    # This uses the 'client' fixture from conftest which has the Bearer token
    payload = {
        "manufacturer_part_number": "SEC-OK-001",
        "description": "Authorized Test Part",
        "part_type": "Other",
        "system": "Other",
        "availability": "Available"
    }
    response = await client.post("/api/v1/parts/", json=payload)
    assert response.status_code == 201
