from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WisdomBase(BaseModel):
    title: str
    category: str
    subcategory: Optional[str] = None
    tip: str
    story: Optional[str] = None
    who_taught: Optional[str] = None
    region: Optional[str] = None
    culture: Optional[str] = None
    ingredients: Optional[str] = None
    steps: Optional[str] = None
    when_used: Optional[str] = None


class WisdomCreate(WisdomBase):
    pass


class WisdomOut(WisdomBase):
    id: int
    evidence_label: str
    risk_level: str
    ai_summary: Optional[str] = None
    tags: Optional[str] = None
    is_approved: bool
    is_flagged: bool
    is_seed_data: bool
    view_count: int
    save_count: int
    helpful_count: int
    image_url: Optional[str] = None
    contributor_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class WisdomList(BaseModel):
    items: List[WisdomOut]
    total: int
    page: int
    per_page: int


class WisdomSubmission(WisdomBase):
    """User contribution form"""
    personal_story: Optional[str] = None


class EvidenceLabelOut(BaseModel):
    label: str
    emoji: str
    description: str
    color: str


EVIDENCE_LABELS = {
    "well_supported": EvidenceLabelOut(
        label="Well Supported",
        emoji="🟢",
        description="Good scientific evidence supports this practice",
        color="green"
    ),
    "some_evidence": EvidenceLabelOut(
        label="Some Evidence",
        emoji="🟡",
        description="Some scientific evidence, but more research needed",
        color="yellow"
    ),
    "limited_evidence": EvidenceLabelOut(
        label="Traditional Practice",
        emoji="🟠",
        description="Traditional practice with limited scientific evidence",
        color="orange"
    ),
    "potentially_unsafe": EvidenceLabelOut(
        label="Caution Advised",
        emoji="🔴",
        description="Potential safety concerns — consult a professional",
        color="red"
    ),
    "insufficient_info": EvidenceLabelOut(
        label="Insufficient Information",
        emoji="⚪",
        description="Insufficient information to evaluate this practice",
        color="gray"
    ),
}
