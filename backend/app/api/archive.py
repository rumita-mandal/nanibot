from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
import os, uuid, aiofiles
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.archive import FamilyArchive
from app.schemas.chat import FamilyArchiveCreate, FamilyArchiveOut

router = APIRouter(prefix="/api/archive", tags=["archive"])


@router.get("", response_model=List[FamilyArchiveOut])
async def get_my_archive(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FamilyArchive)
        .where(FamilyArchive.user_id == current_user.id)
        .order_by(FamilyArchive.created_at.desc())
    )
    return [FamilyArchiveOut.model_validate(a) for a in result.scalars().all()]


@router.post("", response_model=FamilyArchiveOut, status_code=201)
async def create_archive_entry(
    title: str = Form(...),
    tip: str = Form(...),
    category: Optional[str] = Form(None),
    story: Optional[str] = Form(None),
    person_name: Optional[str] = Form(None),
    relationship: Optional[str] = Form(None),
    year_era: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    culture: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    image_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        fn = f"{uuid.uuid4()}{ext}"
        async with aiofiles.open(os.path.join(settings.UPLOAD_DIR, fn), "wb") as f:
            await f.write(await image.read())
        image_url = f"/uploads/{fn}"

    audio_url = None
    audio_transcript = None
    if audio and audio.filename:
        ext = os.path.splitext(audio.filename)[1]
        fn = f"{uuid.uuid4()}{ext}"
        async with aiofiles.open(os.path.join(settings.UPLOAD_DIR, fn), "wb") as f:
            await f.write(await audio.read())
        audio_url = f"/uploads/{fn}"
        audio_transcript = "[Audio recorded — transcript coming soon]"

    entry = FamilyArchive(
        user_id=current_user.id,
        title=title,
        category=category,
        tip=tip,
        story=story,
        person_name=person_name,
        relationship=relationship,
        year_era=year_era,
        region=region,
        culture=culture,
        image_url=image_url,
        audio_url=audio_url,
        audio_transcript=audio_transcript,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return FamilyArchiveOut.model_validate(entry)


@router.get("/{archive_id}", response_model=FamilyArchiveOut)
async def get_archive_entry(
    archive_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FamilyArchive).where(
            FamilyArchive.id == archive_id,
            FamilyArchive.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Archive entry not found")
    return FamilyArchiveOut.model_validate(entry)


@router.delete("/{archive_id}")
async def delete_archive_entry(
    archive_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FamilyArchive).where(
            FamilyArchive.id == archive_id,
            FamilyArchive.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(entry)
    await db.commit()
    return {"deleted": True}
