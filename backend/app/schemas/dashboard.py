from typing import List, Dict, Any
from pydantic import BaseModel
from app.schemas.project import ProjectOut


class DashboardSummary(BaseModel):
    total_projects: int
    active_projects: int
    total_sites: int
    total_area_hectares: float
    avg_carbon_stock: float
    avg_species_richness: float
    recent_projects: List[ProjectOut]
    recent_activity: List[Dict[str, Any]]
