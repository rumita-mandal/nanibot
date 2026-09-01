"""
RAG (Retrieval-Augmented Generation) pipeline.
Manages the ChromaDB vector store and semantic retrieval of wisdom entries.
"""
import chromadb
from chromadb.config import Settings as ChromaSettings
import logging
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.embeddings import embed_text, embed_texts, build_wisdom_document

logger = logging.getLogger(__name__)

_chroma_client: chromadb.PersistentClient | None = None
_collection = None


def get_chroma_client() -> chromadb.PersistentClient:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        logger.info(f"ChromaDB client initialized at {settings.CHROMA_PERSIST_DIR}")
    return _chroma_client


def get_collection():
    global _collection
    if _collection is None:
        client = get_chroma_client()
        _collection = client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(f"ChromaDB collection '{settings.CHROMA_COLLECTION}' ready with {_collection.count()} entries")
    return _collection


def index_wisdom_entry(entry_id: int, entry: Dict[str, Any]) -> None:
    """Add or update a wisdom entry in the vector store."""
    collection = get_collection()
    doc_text = build_wisdom_document(entry)
    embedding = embed_text(doc_text)

    metadata = {
        "id": entry_id,
        "title": entry.get("title", ""),
        "category": entry.get("category", ""),
        "subcategory": entry.get("subcategory", ""),
        "region": entry.get("region", ""),
        "evidence_label": entry.get("evidence_label", "insufficient_info"),
        "risk_level": entry.get("risk_level", "LOW"),
        "is_approved": str(entry.get("is_approved", True)),
    }

    collection.upsert(
        ids=[str(entry_id)],
        embeddings=[embedding],
        documents=[doc_text],
        metadatas=[metadata],
    )
    logger.debug(f"Indexed wisdom entry {entry_id}: {entry.get('title', '')[:50]}")


def index_bulk(entries: List[Dict[str, Any]]) -> None:
    """Bulk index multiple entries at once."""
    if not entries:
        return

    collection = get_collection()
    ids = []
    embeddings = []
    documents = []
    metadatas = []

    doc_texts = [build_wisdom_document(e) for e in entries]
    all_embeddings = embed_texts(doc_texts)

    for entry, doc_text, embedding in zip(entries, doc_texts, all_embeddings):
        ids.append(str(entry["id"]))
        embeddings.append(embedding)
        documents.append(doc_text)
        metadatas.append({
            "id": entry["id"],
            "title": entry.get("title", ""),
            "category": entry.get("category", ""),
            "subcategory": entry.get("subcategory", ""),
            "region": entry.get("region", ""),
            "evidence_label": entry.get("evidence_label", "insufficient_info"),
            "risk_level": entry.get("risk_level", "LOW"),
            "is_approved": str(entry.get("is_approved", True)),
        })

    collection.upsert(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
    logger.info(f"Bulk indexed {len(entries)} wisdom entries")


def semantic_search(
    query: str,
    n_results: int = 5,
    category: Optional[str] = None,
    region: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Perform semantic similarity search against the knowledge base.
    Returns list of relevant wisdom entries with metadata and distances.
    """
    collection = get_collection()

    if collection.count() == 0:
        logger.warning("ChromaDB collection is empty — no results to return")
        return []

    query_embedding = embed_text(query)

    where_filter = {"is_approved": "True"}
    if category:
        where_filter["category"] = category

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, collection.count()),
        where=where_filter if len(where_filter) > 1 else None,
        include=["documents", "metadatas", "distances"],
    )

    output = []
    for i, (doc, meta, dist) in enumerate(zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    )):
        output.append({
            "rank": i + 1,
            "document": doc,
            "metadata": meta,
            "similarity_score": 1 - dist,  # cosine distance → similarity
        })

    return output


def delete_wisdom_entry(entry_id: int) -> None:
    """Remove a wisdom entry from the vector store."""
    collection = get_collection()
    collection.delete(ids=[str(entry_id)])


def get_collection_count() -> int:
    """Return the total number of indexed entries."""
    return get_collection().count()
