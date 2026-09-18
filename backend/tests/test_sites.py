def get_auth_headers(client):
    reg_payload = {
        "name": "Site Tester",
        "email": "sitetester@darukaa.earth",
        "password": "SecurePassword123"
    }
    client.post("/api/auth/register", json=reg_payload)
    login_res = client.post("/api/auth/login", json={
        "email": reg_payload["email"],
        "password": reg_payload["password"]
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_site_creation_and_analytics(client):
    headers = get_auth_headers(client)

    # 1. Create a parent project
    proj_res = client.post("/api/projects", json={
        "name": "Kenya Savanna Protection",
        "project_type": "Carbon",
        "status": "Active",
        "country": "Kenya"
    }, headers=headers)
    proj_id = proj_res.json()["id"]

    # 2. Add Site with GeoJSON Polygon
    site_payload = {
        "name": "Tsavo Sector 1",
        "description": "Savanna soil restoration plot",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [38.0, -3.0],
                    [38.1, -3.0],
                    [38.1, -3.1],
                    [38.0, -3.1],
                    [38.0, -3.0]
                ]
            ]
        }
    }
    site_res = client.post(f"/api/projects/{proj_id}/sites", json=site_payload, headers=headers)
    assert site_res.status_code == 201
    site_data = site_res.json()
    site_id = site_data["id"]
    assert site_data["name"] == site_payload["name"]
    assert site_data["area_hectares"] > 0

    # 3. Get Site Analytics
    analytics_res = client.get(f"/api/sites/{site_id}/analytics", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["site_id"] == site_id
    assert "carbon_stock" in analytics_data
    assert len(analytics_data["time_series"]) >= 1
