import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_location_crud_lifecycle(client: AsyncClient):
    # 1. Create
    create_resp = await client.post(
        "/api/v1/locations/", json={"name": "Warehouse A", "address": "123 Main St"}
    )
    lid = create_resp.json()["id"]

    # 2. Read
    get_resp = await client.get(f"/api/v1/locations/{lid}")
    assert get_resp.status_code == 200

    # 3. Update
    update_resp = await client.patch(f"/api/v1/locations/{lid}", json={"notes": "Updated note"})
    assert update_resp.status_code == 200
    assert update_resp.json()["notes"] == "Updated note"

    # 4. List
    list_resp = await client.get("/api/v1/locations/")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 5. Delete
    delete_resp = await client.delete(f"/api/v1/locations/{lid}")
    assert delete_resp.status_code == 204

    # 6. Read (Verify 404)
    get_gone = await client.get(f"/api/v1/locations/{lid}")
    assert get_gone.status_code == 404
