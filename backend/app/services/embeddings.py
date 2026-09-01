"""
Embeddings service using sentence-transformers (local, completely free).
Converts text to vector embeddings for semantic search in ChromaDB.
"""
from sentence_transformers import SentenceTransformer
from typing import List
import logging

logger = logging.getLogger(__name__)

# Using a small, fast, multilingual model — good for Indian language contexts
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info(f"Loading embedding model: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
        logger.info("Embedding model loaded successfully")
    return _model


def embed_text(text: str) -> List[float]:
    """Embed a single text string."""
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_tensor=False)
    return embedding.tolist()


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Embed a list of texts efficiently."""
    model = get_embedding_model()
    embeddings = model.encode(texts, convert_to_tensor=False, batch_size=32, show_progress_bar=False)
    return [e.tolist() for e in embeddings]


def build_wisdom_document(entry: dict) -> str:
    """
    Create a rich text document from a wisdom entry for embedding.
    Combines multiple fields for better semantic retrieval.
    """
    parts = []
    if entry.get("title"):
        parts.append(f"Title: {entry['title']}")
    if entry.get("category"):
        parts.append(f"Category: {entry['category']}")
    if entry.get("subcategory"):
        parts.append(f"Subcategory: {entry['subcategory']}")
    if entry.get("tip"):
        parts.append(f"Traditional Practice: {entry['tip']}")
    if entry.get("when_used"):
        parts.append(f"Used for: {entry['when_used']}")
    if entry.get("ingredients"):
        parts.append(f"Ingredients: {entry['ingredients']}")
    if entry.get("region"):
        parts.append(f"Region: {entry['region']}")
    if entry.get("tags"):
        import json
        try:
            tags = json.loads(entry["tags"]) if isinstance(entry["tags"], str) else entry["tags"]
            parts.append(f"Tags: {', '.join(tags)}")
        except Exception:
            pass
    return "\n".join(parts)
