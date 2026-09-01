from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship as orm_relationship
from sqlalchemy.sql import func
from app.core.database import Base


class FamilyArchive(Base):
    __tablename__ = "family_archives"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(500), nullable=False)
    category = Column(String(100), nullable=True)
    tip = Column(Text, nullable=False)
    story = Column(Text, nullable=True)

    person_name = Column(String(255), nullable=True)
    relationship = Column(String(100), nullable=True)  # grandmother, mother, aunt, etc.
    year_era = Column(String(100), nullable=True)
    region = Column(String(255), nullable=True)
    culture = Column(String(255), nullable=True)

    image_url = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)
    audio_transcript = Column(Text, nullable=True)

    tags = Column(Text, nullable=True)  # JSON string

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = orm_relationship("User", back_populates="archive_items")
