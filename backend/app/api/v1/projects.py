from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut

router = APIRouter()


def _format_project(project: Project, db: Session) -> ProjectOut:
    sites_count = db.query(func.count(Site.id)).filter(Site.project_id == project.id).scalar() or 0
    total_area = db.query(func.coalesce(func.sum(Site.area_hectares), 0.0)).filter(Site.project_id == project.id).scalar() or 0.0
    
    out = ProjectOut.model_validate(project)
    out.sites_count = sites_count
    out.total_area_hectares = round(float(total_area), 2)
    return out


@router.get("", response_model=List[ProjectOut])
def get_projects(
    search: Optional[str] = None,
    project_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Project)
    
    if search:
        query = query.filter(
            (Project.name.ilike(f"%{search}%")) | (Project.description.ilike(f"%{search}%"))
        )
    if project_type:
        query = query.filter(Project.project_type == project_type)
    if status:
        query = query.filter(Project.status == status)
        
    projects = query.order_by(Project.created_at.desc()).all()
    return [_format_project(p, db) for p in projects]


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=project_in.name,
        description=project_in.description,
        project_type=project_in.project_type,
        status=project_in.status,
        country=project_in.country,
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _format_project(project, db)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    return _format_project(project, db)


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return _format_project(project, db)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    db.delete(project)
    db.commit()
    return None
