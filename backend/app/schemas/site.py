from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class GeoJSONGeometry(BaseModel):
    type: str = Field(default="Polygon", pattern="^Polygon$")
    coordinates: List[List[List[float]]]


class SiteCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    geometry: GeoJSONGeometry
    area_hectares: Optional[float] = None # Calculated automatically if omitted


class SiteUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    geometry: Optional[GeoJSONGeometry] = None
    area_hectares: Optional[float] = None


class SiteOut(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    geometry: Dict[str, Any] # GeoJSON dict
    area_hectares: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SiteFeatureGeoJSON(BaseModel):
    type: str = "Feature"
    id: str
    geometry: Dict[str, Any]
    properties: Dict[str, Any]
