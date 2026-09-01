"""
Database seeder — populates initial wisdom entries and creates admin user.
Run with: uv run python -m app.data.seed
"""
import asyncio
import json
import logging
import os
import sys

# Add the parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, create_all_tables
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.user import User
from app.models.wisdom import WisdomEntry
from app.services.rag import index_bulk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed():
    logger.info("Creating database tables...")
    await create_all_tables()

    async with AsyncSessionLocal() as db:
        # ── Create admin user ─────────────────────────────────────────────────
        result = await db.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
        admin = result.scalar_one_or_none()

        if not admin:
            admin = User(
                email=settings.ADMIN_EMAIL,
                name=settings.ADMIN_NAME,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                is_admin=True,
                is_active=True,
            )
            db.add(admin)
            await db.commit()
            await db.refresh(admin)
            logger.info(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
        else:
            logger.info(f"✅ Admin user already exists: {settings.ADMIN_EMAIL}")

        # ── Load seed wisdom data ─────────────────────────────────────────────
        seed_file = os.path.join(os.path.dirname(__file__), "seed_knowledge.json")
        with open(seed_file, "r", encoding="utf-8") as f:
            seed_entries = json.load(f)

        # Check if seed data already loaded
        result = await db.execute(select(WisdomEntry).where(WisdomEntry.is_seed_data == True))
        existing = result.scalars().all()

        if existing:
            logger.info(f"✅ Seed data already loaded ({len(existing)} entries)")
        else:
            logger.info(f"Loading {len(seed_entries)} seed wisdom entries...")
            wisdom_entries = []
            for entry_data in seed_entries:
                entry = WisdomEntry(
                    title=entry_data["title"],
                    category=entry_data["category"],
                    subcategory=entry_data.get("subcategory"),
                    tip=entry_data["tip"],
                    story=entry_data.get("story"),
                    who_taught=entry_data.get("who_taught"),
                    region=entry_data.get("region"),
                    culture=entry_data.get("culture"),
                    ingredients=entry_data.get("ingredients"),
                    steps=entry_data.get("steps"),
                    when_used=entry_data.get("when_used"),
                    evidence_label=entry_data.get("evidence_label", "insufficient_info"),
                    risk_level=entry_data.get("risk_level", "LOW"),
                    ai_summary=entry_data.get("ai_summary"),
                    tags=entry_data.get("tags"),
                    is_approved=entry_data.get("is_approved", True),
                    is_seed_data=True,
                )
                db.add(entry)
                wisdom_entries.append(entry)

            await db.commit()

            # Refresh to get IDs
            for entry in wisdom_entries:
                await db.refresh(entry)

            logger.info(f"✅ Saved {len(wisdom_entries)} entries to database")

            # ── Index in ChromaDB ─────────────────────────────────────────────
            logger.info("Indexing entries in ChromaDB vector store...")
            bulk_data = [
                {
                    "id": e.id,
                    "title": e.title,
                    "category": e.category,
                    "subcategory": e.subcategory,
                    "tip": e.tip,
                    "when_used": e.when_used,
                    "ingredients": e.ingredients,
                    "region": e.region,
                    "tags": e.tags,
                    "evidence_label": e.evidence_label,
                    "risk_level": e.risk_level,
                    "is_approved": e.is_approved,
                }
                for e in wisdom_entries
            ]
            index_bulk(bulk_data)
            logger.info(f"✅ Indexed {len(bulk_data)} entries in ChromaDB")

    logger.info("🌿 NaniBot seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed())
