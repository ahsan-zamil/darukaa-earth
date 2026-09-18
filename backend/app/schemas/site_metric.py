from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SiteMetricCreate(BaseModel):
    recorded_at: Optional[datetime] = None
    carbon_stock: float = Field(default=0.0, ge=0)
    soil_organic_carbon: float = Field(default=0.0, ge=0, le=100)
    soil_ph: float = Field(default=7.0, ge=0, le=14)
    soil_moisture: float = Field(default=0.0, ge=0, le=100)
    species_richness: int = Field(default=0, ge=0)
    habitat_diversity: float = Field(default=0.0, ge=0)
    temperature: float = Field(default=25.0)
    rainfall: float = Field(default=0.0, ge=0)
    pollution_index: float = Field(default=0.0, ge=0, le=100)
    deforestation_index: float = Field(default=0.0, ge=0, le=100)


class SiteMetricOut(BaseModel):
    id: str
    site_id: str
    recorded_at: datetime
    carbon_stock: float
    soil_organic_carbon: float
    soil_ph: float
    soil_moisture: float
    species_richness: int
    habitat_diversity: float
    temperature: float
    rainfall: float
    pollution_index: float
    deforestation_index: float
    created_at: datetime

    class Config:
        from_attributes = True


class MetricTrend(BaseModel):
    current: float
    previous: float
    change_percent: float
    trend: str # "up", "down", "stable"


class SiteAnalyticsSummary(BaseModel):
    site_id: str
    site_name: str
    area_hectares: float
    carbon_stock: MetricTrend
    soil_organic_carbon: MetricTrend
    species_richness: MetricTrend
    soil_moisture: MetricTrend
    rainfall: MetricTrend
    habitat_diversity: MetricTrend
    time_series: List[SiteMetricOut]
