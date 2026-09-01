import logging
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional, List
import json, os, aiofiles, uuid
from app.core.database import get_db
from app.core.deps import get_current_user_optional, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.wisdom import WisdomEntry, SavedWisdom
from app.schemas.wisdom import WisdomOut, WisdomList, WisdomSubmission
from app.services.rag import index_wisdom_entry, semantic_search, delete_wisdom_entry
from app.services.llm import classify_tip_with_ai

router = APIRouter(prefix="/api/wisdom", tags=["wisdom"])
logger = logging.getLogger(__name__)


@router.get("", response_model=WisdomList)
async def list_wisdom(
    category: Optional[str] = None,
    region: Optional[str] = None,
    evidence_label: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    query = select(WisdomEntry).where(WisdomEntry.is_approved == True)

    if category:
        query = query.where(WisdomEntry.category == category)
    if region:
        query = query.where(WisdomEntry.region.ilike(f"%{region}%"))
    if evidence_label:
        query = query.where(WisdomEntry.evidence_label == evidence_label)
    if search:
        query = query.where(
            or_(
                WisdomEntry.title.ilike(f"%{search}%"),
                WisdomEntry.tip.ilike(f"%{search}%"),
                WisdomEntry.tags.ilike(f"%{search}%"),
            )
        )

    # Count
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    # Paginate
    offset = (page - 1) * per_page
    query = query.order_by(WisdomEntry.save_count.desc(), WisdomEntry.created_at.desc())
    query = query.offset(offset).limit(per_page)

    result = await db.execute(query)
    items = result.scalars().all()

    return WisdomList(
        items=[WisdomOut.model_validate(w) for w in items],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WisdomEntry.category, func.count(WisdomEntry.id).label("count"))
        .where(WisdomEntry.is_approved == True)
        .group_by(WisdomEntry.category)
        .order_by(func.count(WisdomEntry.id).desc())
    )
    rows = result.all()
    return [{"category": r.category, "count": r.count} for r in rows]


@router.get("/regions")
async def get_regions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WisdomEntry.region, func.count(WisdomEntry.id).label("count"))
        .where(WisdomEntry.is_approved == True, WisdomEntry.region.isnot(None))
        .group_by(WisdomEntry.region)
        .order_by(func.count(WisdomEntry.id).desc())
    )
    rows = result.all()
    return [{"region": r.region, "count": r.count} for r in rows]


@router.get("/search")
async def semantic_search_endpoint(
    q: str = Query(..., min_length=2),
    category: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Semantic vector search over the knowledge base."""
    results = semantic_search(query=q, n_results=limit, category=category)

    # Fetch full entries from DB
    ids = [int(r["metadata"]["id"]) for r in results if r.get("similarity_score", 0) > 0.2]
    if not ids:
        return {"results": [], "query": q}

    db_result = await db.execute(
        select(WisdomEntry).where(WisdomEntry.id.in_(ids), WisdomEntry.is_approved == True)
    )
    entries = {e.id: e for e in db_result.scalars().all()}

    ordered = []
    for r in results:
        eid = int(r["metadata"]["id"])
        if eid in entries:
            entry = entries[eid]
            ordered.append({
                "wisdom": WisdomOut.model_validate(entry).model_dump(),
                "similarity_score": round(r["similarity_score"], 3),
            })

    return {"results": ordered, "query": q}


@router.get("/user/saved", response_model=WisdomList)
async def get_saved_wisdom(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(WisdomEntry)
        .join(SavedWisdom, SavedWisdom.wisdom_id == WisdomEntry.id)
        .where(SavedWisdom.user_id == current_user.id)
    )

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = result.scalars().all()

    return WisdomList(
        items=[WisdomOut.model_validate(w) for w in items],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{wisdom_id}", response_model=WisdomOut)
async def get_wisdom(wisdom_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WisdomEntry).where(WisdomEntry.id == wisdom_id, WisdomEntry.is_approved == True)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Wisdom entry not found")

    # Increment view count
    entry.view_count += 1
    await db.commit()
    await db.refresh(entry)
    return WisdomOut.model_validate(entry)


@router.post("/{wisdom_id}/save")
async def save_wisdom(
    wisdom_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check wisdom exists
    result = await db.execute(select(WisdomEntry).where(WisdomEntry.id == wisdom_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")

    # Check if already saved
    existing = await db.execute(
        select(SavedWisdom).where(
            SavedWisdom.user_id == current_user.id,
            SavedWisdom.wisdom_id == wisdom_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already saved")

    save = SavedWisdom(user_id=current_user.id, wisdom_id=wisdom_id)
    db.add(save)
    entry.save_count += 1
    await db.commit()
    return {"saved": True}


@router.delete("/{wisdom_id}/save")
async def unsave_wisdom(
    wisdom_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SavedWisdom).where(
            SavedWisdom.user_id == current_user.id,
            SavedWisdom.wisdom_id == wisdom_id
        )
    )
    save = result.scalar_one_or_none()
    if not save:
        raise HTTPException(status_code=404, detail="Not saved")

    await db.delete(save)

    # Decrement save count
    entry_result = await db.execute(select(WisdomEntry).where(WisdomEntry.id == wisdom_id))
    entry = entry_result.scalar_one_or_none()
    if entry and entry.save_count > 0:
        entry.save_count -= 1

    await db.commit()
    return {"saved": False}
