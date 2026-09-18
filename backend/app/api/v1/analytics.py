from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.site import Site
from app.models.site_metric import SiteMetric
from app.schemas.site_metric import (
    SiteMetricCreate,
    SiteMetricOut,
    SiteAnalyticsSummary,
    MetricTrend,
)

router = APIRouter()


def _calculate_trend(current: float, previous: float) -> MetricTrend:
    if previous == 0:
        change_pct = 0.0
    else:
        change_pct = round(((current - previous) / previous) * 100.0, 1)
    
    if change_pct > 0.5:
        trend = "up"
    elif change_pct < -0.5:
        trend = "down"
    else:
        trend = "stable"

    return MetricTrend(
        current=round(float(current), 2),
        previous=round(float(previous), 2),
        change_percent=change_pct,
        trend=trend,
    )


@router.get("/sites/{site_id}/metrics", response_model=List[SiteMetricOut])
def get_site_metrics(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(SiteMetric)
        .filter(SiteMetric.site_id == site_id)
        .order_by(SiteMetric.recorded_at.asc())
        .all()
    )
    return metrics


@router.post("/sites/{site_id}/metrics", response_model=SiteMetricOut, status_code=status.HTTP_201_CREATED)
def record_site_metric(
    site_id: str,
    metric_in: SiteMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metric = SiteMetric(
        site_id=site_id,
        recorded_at=metric_in.recorded_at,
        carbon_stock=metric_in.carbon_stock,
        soil_organic_carbon=metric_in.soil_organic_carbon,
        soil_ph=metric_in.soil_ph,
        soil_moisture=metric_in.soil_moisture,
        species_richness=metric_in.species_richness,
        habitat_diversity=metric_in.habitat_diversity,
        temperature=metric_in.temperature,
        rainfall=metric_in.rainfall,
        pollution_index=metric_in.pollution_index,
        deforestation_index=metric_in.deforestation_index,
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


@router.get("/sites/{site_id}/analytics", response_model=SiteAnalyticsSummary)
def get_site_analytics(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    metrics = (
        db.query(SiteMetric)
        .filter(SiteMetric.site_id == site_id)
        .order_by(SiteMetric.recorded_at.asc())
        .all()
    )

    if not metrics:
        # Generate baseline metrics if none exist
        curr = SiteMetricOut(
            id="default",
            site_id=site_id,
            recorded_at=site.created_at,
            carbon_stock=120.5,
            soil_organic_carbon=4.2,
            soil_ph=6.8,
            soil_moisture=35.0,
            species_richness=95,
            habitat_diversity=3.1,
            temperature=24.5,
            rainfall=180.0,
            pollution_index=12.0,
            deforestation_index=5.0,
            created_at=site.created_at,
        )
        prev = curr
        time_series = [curr]
    else:
        time_series = metrics
        curr = metrics[-1]
        prev = metrics[-2] if len(metrics) > 1 else metrics[0]

    return SiteAnalyticsSummary(
        site_id=site.id,
        site_name=site.name,
        area_hectares=round(float(site.area_hectares), 2),
        carbon_stock=_calculate_trend(curr.carbon_stock, prev.carbon_stock),
        soil_organic_carbon=_calculate_trend(curr.soil_organic_carbon, prev.soil_organic_carbon),
        species_richness=_calculate_trend(float(curr.species_richness), float(prev.species_richness)),
        soil_moisture=_calculate_trend(curr.soil_moisture, prev.soil_moisture),
        rainfall=_calculate_trend(curr.rainfall, prev.rainfall),
        habitat_diversity=_calculate_trend(curr.habitat_diversity, prev.habitat_diversity),
        time_series=[SiteMetricOut.model_validate(m) for m in time_series],
    )
