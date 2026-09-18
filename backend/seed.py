import os
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from geoalchemy2.elements import WKTElement

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.site_metric import SiteMetric

# Polygon coordinates for realistic ecological biomes
PROJECT_SEED_DATA = [
    {
        "name": "Amazonian Reforestation & Carbon Sink",
        "description": "High-impact native rainforest restoration and carbon sequestering initiative in the Upper Amazon Basin.",
        "project_type": "Carbon",
        "status": "Active",
        "country": "Brazil",
        "sites": [
            {
                "name": "Tapajós Primary Sector A",
                "description": "Dense canopy tropical rainforest protection zone.",
                "area": 1450.50,
                "coordinates": [
                    [-54.95, -3.20],
                    [-54.88, -3.20],
                    [-54.88, -3.27],
                    [-54.95, -3.27],
                    [-54.95, -3.20]
                ]
            },
            {
                "name": "Xingu Buffer Corridor",
                "description": "Riparian corridor re-vegetation site connecting fragmented indigenous land reserves.",
                "area": 920.80,
                "coordinates": [
                    [-52.40, -11.80],
                    [-52.32, -11.80],
                    [-52.32, -11.86],
                    [-52.40, -11.86],
                    [-52.40, -11.80]
                ]
            }
        ]
    },
    {
        "name": "Sundarbans Coastal Mangrove & Tiger Reserve",
        "description": "Coastal wetland habitat protection and blue carbon sequestration in tidal mangrove forests.",
        "project_type": "Biodiversity",
        "status": "Active",
        "country": "India",
        "sites": [
            {
                "name": "Sajnekhali Core Wetland Sanctuary",
                "description": "Tidal deltaic mangrove forest protecting estuarine fauna and soil carbon stocks.",
                "area": 2100.30,
                "coordinates": [
                    [88.75, 21.95],
                    [88.85, 21.95],
                    [88.85, 21.85],
                    [88.75, 21.85],
                    [88.75, 21.95]
                ]
            },
            {
                "name": "Basirhat Delta Re-establishment Zone",
                "description": "Community-led mangrove sapling replanting and erosion mitigation zone.",
                "area": 680.40,
                "coordinates": [
                    [88.90, 22.10],
                    [88.98, 22.10],
                    [88.98, 22.02],
                    [88.90, 22.02],
                    [88.90, 22.10]
                ]
            }
        ]
    },
    {
        "name": "Congo Basin Peatland Conservation",
        "description": "Crucial peatland swamp forest conservation protecting deep soil organic carbon reserves.",
        "project_type": "Mixed",
        "status": "Active",
        "country": "Democratic Republic of Congo",
        "sites": [
            {
                "name": "Cuvette Centrale West Peat Field",
                "description": "Intact tropical peat soil reserve storing significant carbon per hectare.",
                "area": 3400.00,
                "coordinates": [
                    [18.20, -0.50],
                    [18.32, -0.50],
                    [18.32, -0.62],
                    [18.20, -0.62],
                    [18.20, -0.50]
                ]
            },
            {
                "name": "Lac Tumba Ecological Reserve",
                "description": "Freshwater swamp forest and endemic primate habitat monitoring station.",
                "area": 1850.20,
                "coordinates": [
                    [17.90, -0.80],
                    [18.00, -0.80],
                    [18.00, -0.90],
                    [17.90, -0.90],
                    [17.90, -0.80]
                ]
            }
        ]
    },
    {
        "name": "Western Ghats Biodiversity & Watershed Sanctuary",
        "description": "Monsoon rainforest biodiversity hotline protecting endemic flora and watershed stability.",
        "project_type": "Biodiversity",
        "status": "Active",
        "country": "India",
        "sites": [
            {
                "name": "Silent Valley Evergreen Ridge",
                "description": "Continuous tropical evergreen forest canopy guarding endangered lion-tailed macaques.",
                "area": 1280.60,
                "coordinates": [
                    [76.40, 11.10],
                    [76.48, 11.10],
                    [76.48, 11.02],
                    [76.40, 11.02],
                    [76.40, 11.10]
                ]
            }
        ]
    }
]


def seed_database():
    db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    engine = create_engine(db_url)

    # Ensure PostGIS extension exists
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        conn.commit()

    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        # 1. Create or fetch Demo Admin User
        admin_email = "demo@darukaa.earth"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                name="Darukaa Demo Admin",
                email=admin_email,
                password_hash=get_password_hash("Demo@12345"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"✅ Created demo admin: {admin_email} / Demo@12345")
        else:
            print(f"ℹ️ Demo admin already exists: {admin_email}")

        # 2. Seed Projects & Sites if DB is empty
        if db.query(Project).count() == 0:
            now = datetime.now(timezone.utc)
            for p_data in PROJECT_SEED_DATA:
                proj = Project(
                    name=p_data["name"],
                    description=p_data["description"],
                    project_type=p_data["project_type"],
                    status=p_data["status"],
                    country=p_data["country"],
                    owner_id=admin_user.id
                )
                db.add(proj)
                db.commit()
                db.refresh(proj)

                for s_data in p_data["sites"]:
                    coords_str = ", ".join([f"{lon} {lat}" for lon, lat in s_data["coordinates"]])
                    wkt_polygon = f"POLYGON(({coords_str}))"
                    
                    site = Site(
                        project_id=proj.id,
                        name=s_data["name"],
                        description=s_data["description"],
                        geometry=WKTElement(wkt_polygon, srid=4326),
                        area_hectares=s_data["area"]
                    )
                    db.add(site)
                    db.commit()
                    db.refresh(site)

                    # Create 12 months of historical metric data
                    base_carbon = random.uniform(110.0, 190.0)
                    base_soc = random.uniform(3.2, 5.8)
                    base_species = random.randint(60, 160)
                    
                    for month_offset in range(12, -1, -1):
                        recorded_date = now - timedelta(days=month_offset * 30)
                        
                        # Add realistic ecological progression & seasonal variation
                        growth_factor = 1.0 + ((12 - month_offset) * 0.015) # 1.5% monthly growth
                        seasonal_rain = 150.0 + random.uniform(-40, 60)
                        
                        metric = SiteMetric(
                            site_id=site.id,
                            recorded_at=recorded_date,
                            carbon_stock=round(base_carbon * growth_factor + random.uniform(-2, 3), 2),
                            soil_organic_carbon=round(base_soc * (1.0 + (12-month_offset)*0.01) + random.uniform(-0.1, 0.2), 2),
                            soil_ph=round(6.5 + random.uniform(-0.3, 0.4), 2),
                            soil_moisture=round(35.0 + random.uniform(-8.0, 12.0), 2),
                            species_richness=int(base_species + (12 - month_offset) * 2 + random.randint(-3, 5)),
                            habitat_diversity=round(3.2 + (12 - month_offset) * 0.05 + random.uniform(-0.1, 0.1), 2),
                            temperature=round(24.0 + random.uniform(-3.0, 4.0), 2),
                            rainfall=round(seasonal_rain, 2),
                            pollution_index=round(max(15.0 - (12 - month_offset) * 0.5, 3.0), 2),
                            deforestation_index=round(max(12.0 - (12 - month_offset) * 0.6, 1.5), 2),
                        )
                        db.add(metric)
                    
                    db.commit()
            print("✅ Successfully seeded 4 Projects, 7 Geographical Sites, and 91 Historical Metrics!")
        else:
            print("ℹ️ Projects table already contains data, skipping seed.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
