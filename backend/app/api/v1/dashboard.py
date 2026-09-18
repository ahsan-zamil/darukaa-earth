from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.site_metric import SiteMetric
from app.schemas.dashboard import DashboardSummary
from app.api.v1.projects import _format_project

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    active_projects = db.query(func.count(Project.id)).filter(Project.status == "Active").scalar() or 0
    total_sites = db.query(func.count(Site.id)).scalar() or 0
    total_area = db.query(func.coalesce(func.sum(Site.area_hectares), 0.0)).scalar() or 0.0

    avg_carbon = db.query(func.coalesce(func.avg(SiteMetric.carbon_stock), 0.0)).scalar() or 0.0
    avg_species = db.query(func.coalesce(func.avg(SiteMetric.species_richness), 0.0)).scalar() or 0.0

    recent_projects_raw = db.query(Project).order_by(Project.created_at.desc()).limit(5).all()
    recent_projects = [_format_project(p, db) for p in recent_projects_raw]

    # Dynamic recent site activity list
    recent_sites = db.query(Site).order_by(Site.created_at.desc()).limit(5).all()
    recent_activity = []
    for s in recent_sites:
        proj = db.query(Project).filter(Project.id == s.project_id).first()
        recent_activity.append({
            "id": s.id,
            "type": "site_created",
            "title": f"Site '{s.name}' added",
            "subtitle": f"Project: {proj.name if proj else 'Unknown'} | {s.area_hectares} ha",
            "timestamp": s.created_at.isoformat(),
        })

    return DashboardSummary(
        total_projects=total_projects,
        active_projects=active_projects,
        total_sites=total_sites,
        total_area_hectares=round(float(total_area), 2),
        avg_carbon_stock=round(float(avg_carbon), 2),
        avg_species_richness=round(float(avg_species), 1),
        recent_projects=recent_projects,
        recent_activity=recent_activity,
    )
