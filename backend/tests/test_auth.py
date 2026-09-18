def test_register_and_login(client):
    # 1. Register User
    reg_payload = {
        "name": "Test Administrator",
        "email": "testadmin@darukaa.earth",
        "password": "SecurePassword123"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == reg_payload["email"]
    assert "id" in data

    # 2. Login User
    login_payload = {
        "email": reg_payload["email"],
        "password": reg_payload["password"]
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Get Current User /me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == reg_payload["email"]
