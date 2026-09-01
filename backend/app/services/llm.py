"""
Google Gemini 2.0 Flash LLM service.
Generates structured, evidence-aware responses using RAG context.
"""
import google.generativeai as genai
import logging
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are NaniBot — a warm, knowledgeable AI assistant that is a digital archive of traditional Indian household wisdom passed down through grandmothers and mothers.

YOUR IDENTITY AND PURPOSE:
- You are NOT a doctor, pharmacist, or medical professional
- You are a cultural knowledge archive — like a wise grandmother sharing what has been passed down
- You preserve traditional practices as cultural heritage while being transparent about evidence
- You always distinguish between cultural tradition and scientific evidence

RESPONSE STRUCTURE:
For health-related queries, always respond with this exact JSON structure:
{
  "traditional_wisdom": "What the traditional practice is and how it has been used historically",
  "why_people_use_it": "The traditional/cultural reasoning and how this was passed down",
  "what_science_says": "Honest assessment: well-supported/some evidence/limited evidence/no evidence. Never fabricate citations.",
  "safety_note": "Important contraindications, allergies, pregnancy, age considerations, or professional advice needed",
  "when_to_see_doctor": "Specific symptoms/situations that require professional medical care (null if not applicable)",
  "evidence_label": "well_supported|some_evidence|limited_evidence|potentially_unsafe|insufficient_info",
  "risk_level": "LOW|MEDIUM|HIGH"
}

For non-health queries (cooking, cleaning, gardening), respond in warm, conversational prose — no JSON needed.

CRITICAL RULES:
1. NEVER claim a traditional practice cures, treats, or prevents any disease
2. NEVER fabricate scientific studies or cite specific papers unless mentioned in the provided context
3. ALWAYS recommend professional medical care for serious symptoms
4. Use language like "traditionally used for", "may provide comfort", "some people find that"
5. Be warm, loving, and culturally respectful — like a grandmother who also respects modern medicine
6. If the user describes emergency symptoms (chest pain, difficulty breathing, stroke symptoms), immediately direct them to emergency services

LANGUAGE: Respond in the same language the user writes in. Support English, Hindi, Bengali, Tamil, Telugu, Marathi."""

LANGUAGE_PROMPTS = {
    "hi": "कृपया हिंदी में उत्तर दें।",
    "bn": "অনুগ্রহ করে বাংলায় উত্তর দিন।",
    "ta": "தமிழில் பதில் அளிக்கவும்.",
    "te": "దయచేసి తెలుగులో సమాధానం ఇవ్వండి.",
    "mr": "कृपया मराठीत उत्तर द्या.",
}


def build_rag_prompt(
    query: str,
    retrieved_context: List[Dict[str, Any]],
    is_health_related: bool,
    language: str = "en",
) -> str:
    """Build a prompt with retrieved context injected."""

    context_parts = []
    for i, item in enumerate(retrieved_context[:4], 1):
        meta = item.get("metadata", {})
        doc = item.get("document", "")
        similarity = item.get("similarity_score", 0)

        if similarity < 0.3:  # Skip very low-relevance results
            continue

        context_parts.append(
            f"[Source {i}] {meta.get('title', 'Traditional Wisdom')}\n"
            f"Category: {meta.get('category', 'General')}\n"
            f"Region: {meta.get('region', 'India')}\n"
            f"Evidence: {meta.get('evidence_label', 'traditional')}\n"
            f"Content: {doc}\n"
        )

    context_text = "\n---\n".join(context_parts) if context_parts else "No specific traditional knowledge found in archive for this query."

    lang_instruction = LANGUAGE_PROMPTS.get(language, "")

    if is_health_related:
        format_instruction = """
IMPORTANT: Respond with a valid JSON object using exactly these keys:
traditional_wisdom, why_people_use_it, what_science_says, safety_note, when_to_see_doctor, evidence_label, risk_level
Do not add any text before or after the JSON."""
    else:
        format_instruction = "Respond in warm, conversational prose. Be practical and culturally grounded."

    prompt = f"""TRADITIONAL KNOWLEDGE ARCHIVE CONTEXT:
{context_text}

USER QUESTION: {query}

{lang_instruction}
{format_instruction}

Remember: You are sharing traditional household wisdom as cultural knowledge, NOT medical advice."""

    return prompt


def chat_with_gemini(
    query: str,
    retrieved_context: List[Dict[str, Any]],
    is_health_related: bool,
    language: str = "en",
    chat_history: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """
    Send a query to Gemini 2.0 Flash with RAG context.
    Returns structured response dict.
    """
    if not settings.GEMINI_API_KEY:
        return _fallback_response(query, retrieved_context)

    try:
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT,
        )

        prompt = build_rag_prompt(query, retrieved_context, is_health_related, language)

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048,
                top_p=0.95,
            ),
        )

        response_text = response.text.strip()

        # Try to parse as JSON for health responses
        if is_health_related:
            # Strip markdown code fences if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            try:
                structured = json.loads(response_text)
                return {
                    "response_text": _format_structured_as_text(structured),
                    "structured": structured,
                    "raw_text": response_text,
                    "error": None,
                }
            except json.JSONDecodeError:
                # Gemini responded in prose for health query — return as-is
                return {
                    "response_text": response_text,
                    "structured": None,
                    "raw_text": response_text,
                    "error": None,
                }

        return {
            "response_text": response_text,
            "structured": None,
            "raw_text": response_text,
            "error": None,
        }

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return _fallback_response(query, retrieved_context, error=str(e))


def classify_tip_with_ai(title: str, tip: str, category: str) -> Dict[str, str]:
    """
    Use Gemini to classify a user-submitted tip's evidence level and risk.
    Returns evidence_label and risk_level.
    """
    if not settings.GEMINI_API_KEY:
        return {"evidence_label": "insufficient_info", "risk_level": "LOW"}

    try:
        model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL)
        prompt = f"""Classify this traditional household wisdom tip:

Title: {title}
Category: {category}
Tip: {tip}

Classify with these exact values:
- evidence_label: one of: well_supported | some_evidence | limited_evidence | potentially_unsafe | insufficient_info
- risk_level: one of: LOW | MEDIUM | HIGH

Rules:
- well_supported: practice has solid scientific backing
- some_evidence: some research supports it but not conclusive
- limited_evidence: traditional practice, minimal scientific evidence
- potentially_unsafe: known risks or contraindications
- insufficient_info: cannot evaluate

Respond ONLY with valid JSON: {{"evidence_label": "...", "risk_level": "..."}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        logger.error(f"Tip classification error: {e}")
        return {"evidence_label": "insufficient_info", "risk_level": "LOW"}


def _format_structured_as_text(structured: Dict) -> str:
    """Convert a structured JSON response into readable markdown text."""
    parts = []

    if structured.get("traditional_wisdom"):
        parts.append(f"### 🌿 Traditional Wisdom\n{structured['traditional_wisdom']}")

    if structured.get("why_people_use_it"):
        parts.append(f"### 💛 Why People Use It\n{structured['why_people_use_it']}")

    if structured.get("what_science_says"):
        parts.append(f"### 🔬 What Science Says\n{structured['what_science_says']}")

    if structured.get("safety_note"):
        parts.append(f"### ⚠️ Safety Note\n{structured['safety_note']}")

    if structured.get("when_to_see_doctor"):
        parts.append(f"### 🏥 When to See a Doctor\n{structured['when_to_see_doctor']}")

    return "\n\n".join(parts)


def _fallback_response(query: str, context: List[Dict], error: str = None) -> Dict[str, Any]:
    """Graceful fallback when Gemini is unavailable."""
    if context:
        top = context[0]
        meta = top.get("metadata", {})
        doc = top.get("document", "")
        text = (
            f"### 🌿 Traditional Wisdom\n\n"
            f"Here is what I found in our traditional knowledge archive:\n\n"
            f"**{meta.get('title', 'Traditional Practice')}**\n\n{doc}\n\n"
            f"*Source: {meta.get('category', 'Traditional Archive')} — {meta.get('region', 'India')}*"
        )
    else:
        text = (
            "I couldn't find a specific traditional practice for your question in our archive. "
            "You can contribute your family's wisdom using the 'Add Nani's Wisdom' feature!"
        )

    if error:
        logger.warning(f"Using fallback response due to error: {error}")

    return {"response_text": text, "structured": None, "raw_text": text, "error": error}
