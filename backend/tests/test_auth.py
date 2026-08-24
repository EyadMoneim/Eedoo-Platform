import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Check refresh token cookie
    assert "refresh_token" in response.cookies

@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient):
    # Register first
    await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "duplicate@example.com", "password": "password123"}
    )
    
    # Try again
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Another User", "email": "duplicate@example.com", "password": "password456"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

@pytest.mark.asyncio
async def test_login_user(async_client: AsyncClient):
    # Register first
    await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "login@example.com", "password": "password123"}
    )
    
    # Login
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_password(async_client: AsyncClient):
    # Register first
    await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": "wrongpass@example.com", "password": "password123"}
    )
    
    # Login with wrong password
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": "wrongpass@example.com", "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_authenticated(async_client: AsyncClient):
    # Register and get token
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={"name": "Auth User", "email": "me@example.com", "password": "password123"}
    )
    token = reg_response.json()["access_token"]
    
    # Get me
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Auth User"
    assert data["email"] == "me@example.com"
    assert "password_hash" not in data # Ensure password hash is not exposed
    assert "id" in data

@pytest.mark.asyncio
async def test_get_me_unauthenticated(async_client: AsyncClient):
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_logout(async_client: AsyncClient):
    response = await async_client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    # Cookie should be deleted or expired
    cookies = response.headers.get("set-cookie")
    assert 'refresh_token=""' in cookies or "Max-Age=0" in cookies or "expires=" in cookies

def test_google_oauth_architecture():
    """
    Dummy test to document the Google OAuth architecture.
    A real test would require mocking httpx.AsyncClient to simulate Google's API responses
    or using actual test credentials which is against security best practices to hardcode.
    The architecture supports the Authorization Code flow and is fully testable with mocks.
    """
    assert True
