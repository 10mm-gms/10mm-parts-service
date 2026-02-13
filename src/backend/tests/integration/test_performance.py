import time

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_search_performance(client: AsyncClient):
    """
    REQ-PARTS-PERF-1: Search Performance (NFR-001)
    Backend query time < 800ms
    """
    # Seed some data if needed, but integration tests usually have enough
    # or the database is already seeded by the system

    start_time = time.perf_counter()
    response = await client.get("/api/v1/search/?q=test")
    end_time = time.perf_counter()

    duration_ms = (end_time - start_time) * 1000
    assert response.status_code == 200
    assert duration_ms < 800, f"Search took {duration_ms:.2f}ms, which is > 800ms"
    print(f"\nSearch performance: {duration_ms:.2f}ms")
