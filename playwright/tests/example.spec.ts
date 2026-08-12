import { test, expect } from '@playwright/test';

test('login', async ({ request }) => {
    const response = await request.post('https://api.qaautomationlabs.com/v1/auth/login', {
        data: {
            "email": "qa@demo.io",
            "password": "Password123"
        }
    });
    await expect(response).toBeOK();
});

