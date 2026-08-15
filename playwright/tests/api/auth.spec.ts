import { test, expect } from '@playwright/test';
import { jwtDecode } from 'jwt-decode';

test('login token is JWT', async ({ request }) => {
    const data = {
        "email": "qa@demo.io",
        "password": "Password123"
    };
    const response = await request.post('v1/auth/login', {
        data: data
    });
    await expect(response).toBeOK();
    const responseData = await response.json();
    console.log(responseData);
    const token = responseData.data.accessToken;
    const tokenHeader = jwtDecode(token, { header: true });
    expect(tokenHeader.typ).toBe("JWT");
});

test('Error code 401 on wrong password', async ({ request }) => {
    const data = {
        "email": "qa@demo.io",
        "password": "WrongPassword123"
    };
    const response = await request.post('v1/auth/login', {
        data: data
    });
    expect(response.status()).toBe(401);
});

test('register new user', async ({ request }) => {
    const data = {
        name: "New User",
        email: "new.user@example.com",
        password: "Password123"
    }
    const response = await request.post('v1/auth/register', {
        data: JSON.stringify(data),
    });
    await expect(response).toBeOK();
    const responseData = await response.json();
    expect(responseData.data.name).toBe(data.name);
    expect(responseData.data.email).toBe(data.email);
    expect(responseData.data.role).toBe("user");
});

test('Refresh token expands timestamp', async ({ request }) => {
    // Get valild token
    const userName = {
        "email": "qa@demo.io",
        "password": "Password123"
    };
    const loginRes = await request.post('v1/auth/login', {
        data: userName
    });
    await expect(loginRes).toBeOK();
    const refreshToken = (await loginRes.json()).data.refreshToken;
    const timestampOriginal = (await loginRes.json()).meta.timestamp;

    //Refresh valid token
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second to ensure timestamp difference
    const data = {
        "refreshToken": refreshToken
    }
    const response = await request.post('v1/auth/refresh', {
        data: data,
    });
    await expect(response).toBeOK();
    const timestampRefreshed = (await response.json()).meta.timestamp;
    expect(Date.parse(timestampRefreshed)).toBeGreaterThan(Date.parse(timestampOriginal));
});

test('Use token to identify user', async ({ request }) => {
    // Get valild token
    const userName = {
        "email": "qa@demo.io",
        "password": "Password123"
    };
    const loginRes = await request.post('v1/auth/login', {
        data: userName
    });
    await expect(loginRes).toBeOK();
    const accessToken = (await loginRes.json()).data.accessToken;

    // Attach token to request header and get user info
    const response = await request.get('v1/auth/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    await expect(response).toBeOK();
    expect((await response.json()).data.email).toBe(userName.email);

});

test('Logout', async ({ request }) => {
    const response = await request.post('v1/auth/logout', { data: {} });
    await expect(response).toBeOK();
});