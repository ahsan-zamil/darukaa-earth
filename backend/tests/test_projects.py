def get_auth_headers(client):
    reg_payload = {
        "name": "Project Tester",
        "email": "projtester@darukaa.earth",
        "password": "SecurePassword123"
    }
    client.post("/api/auth/register", json=reg_payload)
    login_res = client.post("/api/auth/login", json={
        "email": reg_payload["email"],
        "password": reg_payload["password"]
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_project_crud(client):
    headers = get_auth_headers(client)

    # 1. Create Project
    proj_payload = {
        "name": "Borneo Peat Forest Restoration",
        "description": "Restoring tropical peatland biodiversity.",
        "project_type": "Biodiversity",
        "status": "Active",
        "country": "Indonesia"
    }
    create_res = client.post("/api/projects", json=proj_payload, headers=headers)
    assert create_res.status_code == 201
    proj_data = create_res.json()
    proj_id = proj_data["id"]
    assert proj_data["name"] == proj_payload["name"]

    # 2. List Projects
    list_res = client.get("/api/projects", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Get Single Project
    get_res = client.get(f"/api/projects/{proj_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == proj_id

    # 4. Delete Project
    del_res = client.delete(f"/api/projects/{proj_id}", headers=headers)
    assert del_res.status_code == 204
