import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class SiteMetric(Base):
    __tablename__ = "site_metrics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(String, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    
    # Environmental & Biodiversity Metrics
    carbon_stock: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)          # tCO2e/ha
    soil_organic_carbon: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)   # % SOC
    soil_ph: Mapped[float] = mapped_column(Float, default=7.0, nullable=False)               # pH 0-14
    soil_moisture: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)         # %
    species_richness: Mapped[int] = mapped_column(Integer, default=0, nullable=False)         # Species count
    habitat_diversity: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)     # Shannon index (0-5)
    temperature: Mapped[float] = mapped_column(Float, default=25.0, nullable=False)          # °C
    rainfall: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)              # mm/month
    pollution_index: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)       # Index 0-100
    deforestation_index: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)   # Index 0-100

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    site = relationship("Site", back_populates="metrics")
