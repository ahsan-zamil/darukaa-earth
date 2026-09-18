"""Initial PostGIS schema migration for users, projects, sites, and site_metrics

Revision ID: 001_initial_tables
Revises: 
Create Date: 2026-09-18 17:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


revision: str = '001_initial_tables'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable PostGIS extension
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # Table: users
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='admin'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Table: projects
    op.create_table(
        'projects',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('project_type', sa.String(length=50), nullable=False, server_default='Carbon'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Active'),
        sa.Column('country', sa.String(length=100), nullable=False, server_default='Global'),
        sa.Column('owner_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Table: sites
    op.create_table(
        'sites',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('geometry', geoalchemy2.types.Geometry(geometry_type='POLYGON', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=False),
        sa.Column('area_hectares', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Table: site_metrics
    op.create_table(
        'site_metrics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('site_id', sa.String(), nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('carbon_stock', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('soil_organic_carbon', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('soil_ph', sa.Float(), nullable=False, server_default='7.0'),
        sa.Column('soil_moisture', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('species_richness', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('habitat_diversity', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('temperature', sa.Float(), nullable=False, server_default='25.0'),
        sa.Column('rainfall', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('pollution_index', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('deforestation_index', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['site_id'], ['sites.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_site_metrics_recorded_at'), 'site_metrics', ['recorded_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_site_metrics_recorded_at'), table_name='site_metrics')
    op.drop_table('site_metrics')
    op.drop_table('sites')
    op.drop_table('projects')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
