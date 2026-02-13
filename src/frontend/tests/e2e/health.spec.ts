import { test, expect } from '@playwright/test';

test('backend health check', async ({ request }) => {
    // Call backend directly on port 8000
    const health = await request.get('http://localhost:8001/health');
    expect(health.ok()).toBeTruthy();
    expect(await health.json()).toEqual({ status: 'ok' });
});
