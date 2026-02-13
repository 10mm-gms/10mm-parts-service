import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_link_lifecycle(client: AsyncClient):
    # 1. Create part
    p_resp = await client.post(
        "/api/v1/parts/",
        json={
            "manufacturer_part_number": "P1",
            "description": "Part 1",
            "part_type": "T1",
            "system": "S1",
        },
    )
    pid = p_resp.json()["id"]

    # 2. Create vehicle
    v_resp = await client.post(
        "/api/v1/vehicles/",
        json={
            "make": "M1",
            "model": "M1",
            "from_year": 2020,
            "power_type": "EV",
            "body_style": "SUV",
            "drive_type": "AWD",
        },
    )
    vid = v_resp.json()["id"]

    # 3. Link
    link_resp = await client.post(f"/api/v1/parts/{pid}/vehicles/{vid}")
    assert link_resp.status_code == 201

    # 4. View parts for vehicle
    v_parts_resp = await client.get(f"/api/v1/vehicles/{vid}/parts")
    assert v_parts_resp.status_code == 200
    assert any(p["id"] == pid for p in v_parts_resp.json())

    # 5. View vehicles for part
    p_vehs_resp = await client.get(f"/api/v1/parts/{pid}/vehicles")
    assert p_vehs_resp.status_code == 200
    assert any(v["id"] == vid for v in p_vehs_resp.json())

    # 6. Unlink
    unlink_resp = await client.delete(f"/api/v1/parts/{pid}/vehicles/{vid}")
    assert unlink_resp.status_code == 204

    # 7. Verify unlinked
    v_parts_gone = await client.get(f"/api/v1/vehicles/{vid}/parts")
    assert not any(p["id"] == pid for p in v_parts_gone.json())
