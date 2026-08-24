import pytest
from httpx import AsyncClient

# --- Categories ---

@pytest.mark.asyncio
async def test_get_categories_creates_default(async_client: AsyncClient, auth_headers: dict):
    response = await async_client.get("/api/v1/money/categories", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8 # Default categories
    assert any(c["name"] == "Food" for c in data)

@pytest.mark.asyncio
async def test_create_category(async_client: AsyncClient, auth_headers: dict):
    response = await async_client.post(
        "/api/v1/money/categories",
        headers=auth_headers,
        json={"name": "Custom", "icon": "🚀"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Custom"

# --- People ---

@pytest.mark.asyncio
async def test_person_crud(async_client: AsyncClient, auth_headers: dict):
    # Create
    response = await async_client.post(
        "/api/v1/money/people",
        headers=auth_headers,
        json={"name": "Mohamed", "email": "mohamed@test.com"}
    )
    assert response.status_code == 200
    person_id = response.json()["id"]

    # Get
    response = await async_client.get(f"/api/v1/money/people/{person_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Mohamed"

    # Update
    response = await async_client.patch(
        f"/api/v1/money/people/{person_id}",
        headers=auth_headers,
        json={"name": "Mohamed Ali"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Mohamed Ali"

    # Delete
    response = await async_client.delete(f"/api/v1/money/people/{person_id}", headers=auth_headers)
    assert response.status_code == 200

# --- Transactions and Debt ---

@pytest.mark.asyncio
async def test_transaction_crud_and_debt_calculations(async_client: AsyncClient, auth_headers: dict):
    # Create Person
    response = await async_client.post("/api/v1/money/people", headers=auth_headers, json={"name": "Alice"})
    person_id = response.json()["id"]

    # Create Category
    response = await async_client.post("/api/v1/money/categories", headers=auth_headers, json={"name": "Food"})
    category_id = response.json()["id"]

    # 1. Personal Expense
    response = await async_client.post(
        "/api/v1/money/transactions",
        headers=auth_headers,
        json={
            "type": "PERSONAL_EXPENSE",
            "amount": 50.0,
            "category_id": category_id,
            "transaction_date": "2026-08-24"
        }
    )
    assert response.status_code == 200
    
    # 2. Income
    response = await async_client.post(
        "/api/v1/money/transactions",
        headers=auth_headers,
        json={
            "type": "INCOME",
            "amount": 1000.0,
            "transaction_date": "2026-08-24"
        }
    )
    assert response.status_code == 200

    # 3. Lent to Alice
    response = await async_client.post(
        "/api/v1/money/transactions",
        headers=auth_headers,
        json={
            "type": "LENT_TO_PERSON",
            "person_id": person_id,
            "amount": 200.0,
            "transaction_date": "2026-08-24"
        }
    )
    assert response.status_code == 200

    # 4. Received back from Alice
    response = await async_client.post(
        "/api/v1/money/transactions",
        headers=auth_headers,
        json={
            "type": "RECEIVED_FROM_PERSON",
            "person_id": person_id,
            "amount": 50.0,
            "transaction_date": "2026-08-24"
        }
    )
    assert response.status_code == 200
    
    # 5. Borrowed from Alice
    response = await async_client.post(
        "/api/v1/money/transactions",
        headers=auth_headers,
        json={
            "type": "BORROWED_FROM_PERSON",
            "person_id": person_id,
            "amount": 30.0,
            "transaction_date": "2026-08-24"
        }
    )
    assert response.status_code == 200

    # --- Check Person Summary (Debt) ---
    response = await async_client.get(f"/api/v1/money/people/{person_id}/summary", headers=auth_headers)
    assert response.status_code == 200
    summary = response.json()
    assert float(summary["total_lent"]) == 200.0
    assert float(summary["total_received"]) == 50.0
    assert float(summary["total_borrowed"]) == 30.0
    assert float(summary["total_repaid"]) == 0.0
    # Current balance: (200 - 50) - (30 - 0) = 150 - 30 = 120
    assert float(summary["current_balance"]) == 120.0

    # --- Check Money Summary ---
    response = await async_client.get("/api/v1/money/summary", headers=auth_headers)
    assert response.status_code == 200
    money_summary = response.json()
    
    assert float(money_summary["total_income"]) == 1000.0
    assert float(money_summary["total_personal_expenses"]) == 50.0
    assert float(money_summary["money_owed_to_user"]) == 150.0 # 200 - 50
    assert float(money_summary["money_user_owes"]) == 30.0
    
    # Cash Balance = Income (1000) - Expense (50) - Lent (200) + Received (50) + Borrowed (30) = 830
    assert float(money_summary["cash_balance"]) == 830.0
    
    # Net Position = Cash (830) + Owed to user (150) - User owes (30) = 950
    assert float(money_summary["net_position"]) == 950.0

@pytest.mark.asyncio
async def test_transaction_validation(async_client: AsyncClient, auth_headers: dict):
    # Invalid amount (negative)
    response = await async_client.post(
        "/api/v1/money/transactions",
        headers=auth_headers,
        json={
            "type": "PERSONAL_EXPENSE",
            "amount": -50.0,
            "transaction_date": "2026-08-24"
        }
    )
    assert response.status_code == 422
    
    # Missing person for LENT_TO_PERSON
    response = await async_client.post(
        "/api/v1/money/transactions",
        headers=auth_headers,
        json={
            "type": "LENT_TO_PERSON",
            "amount": 50.0,
            "transaction_date": "2026-08-24"
        }
    )
    assert response.status_code == 422

# User isolation is implicitly tested by the service checks which use `user_id` from the auth token to filter.
