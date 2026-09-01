from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatSource(BaseModel):
    id: int
    title: str
    category: str
    evidence_label: str
    region: Optional[str] = None
    source_type: str  # "traditional_archive" | "user_contribution" | "curated_seed"


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "en"


class StructuredResponse(BaseModel):
    traditional_wisdom: str
    why_people_use_it: str
    what_science_says: str
    safety_note: str
    when_to_see_doctor: Optional[str] = None
    evidence_label: str
    risk_level: str


class ChatResponse(BaseModel):
    message_id: int
    session_id: str
    response_text: str
    structured: Optional[StructuredResponse] = None
    sources: List[ChatSource] = []
    source_explanation: str
    risk_level: str
    is_health_related: bool
    language: str


class FamilyArchiveCreate(BaseModel):
    title: str
    category: Optional[str] = None
    tip: str
    story: Optional[str] = None
    person_name: Optional[str] = None
    relationship: Optional[str] = None
    year_era: Optional[str] = None
    region: Optional[str] = None
    culture: Optional[str] = None


class FamilyArchiveOut(FamilyArchiveCreate):
    id: int
    user_id: int
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    audio_transcript: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminStats(BaseModel):
    total_wisdom: int
    approved_wisdom: int
    pending_wisdom: int
    flagged_wisdom: int
    total_users: int
    total_contributors: int
    total_chats: int
    categories: dict
    regions: dict
    evidence_distribution: dict
    risk_distribution: dict


class SearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    region: Optional[str] = None
    evidence_label: Optional[str] = None
    limit: int = 10
