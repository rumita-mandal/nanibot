from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_admin_user
from app.models.user import User
from app.models.wisdom import WisdomEntry, ChatMessage
from app.models.archive import FamilyArchive
from app.schemas.wisdom import WisdomOut
from app.schemas.chat import AdminStats
from app.services.rag import index_wisdom_entry, delete_wisdom_entry

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    # Wisdom counts
    total_w = await db.execute(select(func.count(WisdomEntry.id)))
    approved_w = await db.execute(select(func.count(WisdomEntry.id)).where(WisdomEntry.is_approved == True))
    pending_w = await db.execute(select(func.count(WisdomEntry.id)).where(WisdomEntry.is_approved == False, WisdomEntry.is_flagged == False))
    flagged_w = await db.execute(select(func.count(WisdomEntry.id)).where(WisdomEntry.is_flagged == True))

    # User counts
    total_u = await db.execute(select(func.count(User.id)))
    contributors = await db.execute(
        select(func.count(func.distinct(WisdomEntry.contributor_id)))
        .where(WisdomEntry.contributor_id.isnot(None))
    )

    # Chat count
    total_chats = await db.execute(select(func.count(ChatMessage.id)).where(ChatMessage.role == "user"))

    # Categories
    cat_result = await db.execute(
        select(WisdomEntry.category, func.count(WisdomEntry.id))
        .where(WisdomEntry.is_approved == True)
        .group_by(WisdomEntry.category)
    )
    categories = {r[0]: r[1] for r in cat_result.all()}

    # Regions
    reg_result = await db.execute(
        select(WisdomEntry.region, func.count(WisdomEntry.id))
        .where(WisdomEntry.is_approved == True, WisdomEntry.region.isnot(None))
        .group_by(WisdomEntry.region)
        .limit(10)
    )
    regions = {r[0]: r[1] for r in reg_result.all()}

    # Evidence distribution
    ev_result = await db.execute(
        select(WisdomEntry.evidence_label, func.count(WisdomEntry.id))
        .where(WisdomEntry.is_approved == True)
        .group_by(WisdomEntry.evidence_label)
    )
    evidence_dist = {r[0]: r[1] for r in ev_result.all()}

    # Risk distribution
    risk_result = await db.execute(
        select(WisdomEntry.risk_level, func.count(WisdomEntry.id))
        .where(WisdomEntry.is_approved == True)
        .group_by(WisdomEntry.risk_level)
    )
    risk_dist = {r[0]: r[1] for r in risk_result.all()}

    return AdminStats(
        total_wisdom=total_w.scalar(),
        approved_wisdom=approved_w.scalar(),
        pending_wisdom=pending_w.scalar(),
        flagged_wisdom=flagged_w.scalar(),
        total_users=total_u.scalar(),
        total_contributors=contributors.scalar(),
        total_chats=total_chats.scalar(),
        categories=categories,
        regions=regions,
        evidence_distribution=evidence_dist,
        risk_distribution=risk_dist,
    )


@router.get("/pending")
async def get_pending_submissions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    query = select(WisdomEntry).where(WisdomEntry.is_approved == False, WisdomEntry.is_flagged == False)
    count = await db.execute(select(func.count()).select_from(query.subquery()))
    offset = (page - 1) * per_page
    result = await db.execute(query.order_by(WisdomEntry.created_at.desc()).offset(offset).limit(per_page))
    items = result.scalars().all()
    return {"items": [WisdomOut.model_validate(w) for w in items], "total": count.scalar()}


@router.post("/wisdom/{wisdom_id}/approve")
async def approve_wisdom(
    wisdom_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(WisdomEntry).where(WisdomEntry.id == wisdom_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")

    from datetime import datetime, timezone
    entry.is_approved = True
    entry.approved_by_id = admin.id
    entry.approved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(entry)

    # Index in vector store
    index_wisdom_entry(entry.id, {
        "title": entry.title, "category": entry.category, "subcategory": entry.subcategory,
        "tip": entry.tip, "when_used": entry.when_used, "ingredients": entry.ingredients,
        "region": entry.region, "tags": entry.tags, "evidence_label": entry.evidence_label,
        "risk_level": entry.risk_level, "is_approved": True,
    })

    return {"approved": True, "id": wisdom_id}


@router.post("/wisdom/{wisdom_id}/reject")
async def reject_wisdom(
    wisdom_id: int,
    reason: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(WisdomEntry).where(WisdomEntry.id == wisdom_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")

    entry.is_flagged = True
    entry.rejection_reason = reason
    await db.commit()
    return {"rejected": True, "id": wisdom_id}


@router.post("/wisdom/{wisdom_id}/flag")
async def flag_wisdom(
    wisdom_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(WisdomEntry).where(WisdomEntry.id == wisdom_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    entry.is_flagged = True
    await db.commit()
    return {"flagged": True}


@router.delete("/wisdom/{wisdom_id}")
async def delete_wisdom(
    wisdom_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(WisdomEntry).where(WisdomEntry.id == wisdom_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(entry)
    await db.commit()
    delete_wisdom_entry(wisdom_id)
    return {"deleted": True}
