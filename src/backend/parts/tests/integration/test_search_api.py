import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_search(client: AsyncClient):
    # 1. Seed data
    await client.post(
        "/api/v1/parts/",
        json={
            "manufacturer_part_number": "UNIQUE-PART",
            "description": "Unique Description Spark Plug",
            "part_type": "Spark Plug",
            "system": "Electrical",
        },
    )
    await client.post(
        "/api/v1/vehicles/",
        json={
            "make": "UniqueMake",
            "model": "UniqueModel",
            "from_year": 2022,
            "power_type": "PHEV",
            "body_style": "Coupe",
            "drive_type": "RWD",
        },
    )

    # 2. Search for part
    resp1 = await client.get("/api/v1/search/", params={"q": "spark"})
    assert resp1.status_code == 200
    assert len(resp1.json()["parts"]) >= 1

    # 3. Search for vehicle
    resp2 = await client.get("/api/v1/search/", params={"q": "uniquemake"})
    assert resp2.status_code == 200
    assert len(resp2.json()["vehicles"]) >= 1

    # 4. Search for something non-existent
    resp3 = await client.get("/api/v1/search/", params={"q": "nonexistentthingy"})
    assert resp3.status_code == 200
    assert len(resp3.json()["parts"]) == 0
    assert len(resp3.json()["vehicles"]) == 0
