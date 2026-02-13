import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_stock_level_lifecycle(client: AsyncClient):
    # 1. Create part
    p_resp = await client.post(
        "/api/v1/parts/",
        json={
            "manufacturer_part_number": "P-STOCK",
            "description": "Stock Part",
            "part_type": "T1",
            "system": "S1",
        },
    )
    pid = p_resp.json()["id"]

    # 2. Create location
    l_resp = await client.post(
        "/api/v1/locations/", json={"name": "Warehouse B", "address": "456 Side St"}
    )
    lid = l_resp.json()["id"]

    # 3. Set stock
    stock_resp = await client.post(
        f"/api/v1/parts/{pid}/stock", json={"location_id": lid, "quantity": 10}
    )
    assert stock_resp.status_code == 200
    assert stock_resp.json()["quantity"] == 10

    # 4. View stock
    get_stock_resp = await client.get(f"/api/v1/parts/{pid}/stock")
    assert any(s["location_id"] == lid and s["quantity"] == 10 for s in get_stock_resp.json())

    # 5. Update stock
    update_stock_resp = await client.post(
        f"/api/v1/parts/{pid}/stock", json={"location_id": lid, "quantity": 5}
    )
    assert update_stock_resp.json()["quantity"] == 5
