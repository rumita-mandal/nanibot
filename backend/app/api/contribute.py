from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import os, uuid, aiofiles
from app.core.database import get_db
from app.core.deps import get_current_user_optional, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.wisdom import WisdomEntry
from app.services.rag import index_wisdom_entry
from app.services.llm import classify_tip_with_ai
from app.schemas.wisdom import WisdomOut

router = APIRouter(prefix="/api/contribute", tags=["contribute"])


@router.post("", response_model=WisdomOut, status_code=201)
async def contribute_wisdom(
    title: str = Form(...),
    category: str = Form(...),
    tip: str = Form(...),
    subcategory: Optional[str] = Form(None),
    story: Optional[str] = Form(None),
    who_taught: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    culture: Optional[str] = Form(None),
    ingredients: Optional[str] = Form(None),
    steps: Optional[str] = Form(None),
    when_used: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    # ── AI Classification ─────────────────────────────────────────────────────
    classification = classify_tip_with_ai(title=title, tip=tip, category=category)

    # ── Handle image upload ───────────────────────────────────────────────────
    image_url = None
    if image and image.filename:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, "wb") as f:
            content = await image.read()
            await f.write(content)
        image_url = f"/uploads/{filename}"

    # ── Create entry (pending approval) ──────────────────────────────────────
    entry = WisdomEntry(
        title=title,
        category=category,
        subcategory=subcategory,
        tip=tip,
        story=story,
        who_taught=who_taught,
        region=region,
        culture=culture,
        ingredients=ingredients,
        steps=steps,
        when_used=when_used,
        image_url=image_url,
        evidence_label=classification.get("evidence_label", "insufficient_info"),
        risk_level=classification.get("risk_level", "LOW"),
        is_approved=False,  # Requires admin approval
        is_seed_data=False,
        contributor_id=current_user.id if current_user else None,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    return WisdomOut.model_validate(entry)


@router.get("/my-submissions")
async def get_my_submissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    result = await db.execute(
        select(WisdomEntry)
        .where(WisdomEntry.contributor_id == current_user.id)
        .order_by(WisdomEntry.created_at.desc())
    )
    entries = result.scalars().all()
    return [WisdomOut.model_validate(e) for e in entries]
