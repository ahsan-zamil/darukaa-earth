from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    project_type: str = Field(default="Carbon", pattern="^(Carbon|Biodiversity|Mixed)$")
    status: str = Field(default="Active", pattern="^(Active|Draft|Completed)$")
    country: str = Field(default="Global", max_length=100)


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    project_type: Optional[str] = Field(None, pattern="^(Carbon|Biodiversity|Mixed)$")
    status: Optional[str] = Field(None, pattern="^(Active|Draft|Completed)$")
    country: Optional[str] = Field(None, max_length=100)


class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    project_type: str
    status: str
    country: str
    owner_id: str
    sites_count: int = 0
    total_area_hectares: float = 0.0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
