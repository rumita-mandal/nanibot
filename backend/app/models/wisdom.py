from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class WisdomEntry(Base):
    __tablename__ = "wisdom_entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    tip = Column(Text, nullable=False)
    story = Column(Text, nullable=True)
    who_taught = Column(String(255), nullable=True)
    region = Column(String(255), nullable=True, index=True)
    culture = Column(String(255), nullable=True)
    ingredients = Column(Text, nullable=True)  # JSON string
    steps = Column(Text, nullable=True)
    when_used = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    # AI Classification
    evidence_label = Column(String(50), default="insufficient_info")
    # values: well_supported | some_evidence | limited_evidence | potentially_unsafe | insufficient_info
    risk_level = Column(String(20), default="LOW")
    # values: LOW | MEDIUM | HIGH | CRITICAL
    ai_summary = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)  # JSON string of tags

    # Moderation
    is_approved = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    is_seed_data = Column(Boolean, default=False)
    rejection_reason = Column(Text, nullable=True)
    moderation_notes = Column(Text, nullable=True)

    # Stats
    view_count = Column(Integer, default=0)
    save_count = Column(Integer, default=0)
    helpful_count = Column(Integer, default=0)

    # Foreign keys
    contributor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    contributor = relationship("User", back_populates="contributions", foreign_keys=[contributor_id])
    saved_by = relationship("SavedWisdom", back_populates="wisdom")


class SavedWisdom(Base):
    __tablename__ = "saved_wisdom"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wisdom_id = Column(Integer, ForeignKey("wisdom_entries.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="saved_wisdom")
    wisdom = relationship("WisdomEntry", back_populates="saved_by")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    messages = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    sources_used = Column(Text, nullable=True)  # JSON string of wisdom IDs
    risk_level = Column(String(20), nullable=True)
    language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")
