import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_vehicle(client: AsyncClient):
    payload = {
        "make": "Tesla",
        "model": "Model 3",
        "from_year": 2017,
        "power_type": "EV",
        "body_style": "Saloon",
        "drive_type": "RWD",
    }
    response = await client.post("/api/v1/vehicles/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["make"] == "Tesla"
    assert "id" in data


@pytest.mark.asyncio
async def test_vehicle_crud_lifecycle(client: AsyncClient):
    # 1. Create
    create_resp = await client.post(
        "/api/v1/vehicles/",
        json={
            "make": "Nissan",
            "model": "Leaf",
            "from_year": 2010,
            "power_type": "EV",
            "body_style": "Hatchback",
            "drive_type": "FWD",
        },
    )
    vid = create_resp.json()["id"]

    # 2. Read
    get_resp = await client.get(f"/api/v1/vehicles/{vid}")
    assert get_resp.status_code == 200

    # 3. Update
    update_resp = await client.patch(f"/api/v1/vehicles/{vid}", json={"model": "Leaf e+"})
    assert update_resp.status_code == 200
    assert update_resp.json()["model"] == "Leaf e+"

    # 4. List
    list_resp = await client.get("/api/v1/vehicles/")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 5. Delete
    delete_resp = await client.delete(f"/api/v1/vehicles/{vid}")
    assert delete_resp.status_code == 204

    # 6. Read (Verify 404)
    get_gone = await client.get(f"/api/v1/vehicles/{vid}")
    assert get_gone.status_code == 404
