"""
Safety classifier — runs before every health-related LLM call.
Detects high-risk symptoms and escalates to professional care recommendations.
"""
from typing import Tuple
import re

# ─── Critical / Emergency Symptoms ──────────────────────────────────────────
CRITICAL_SYMPTOMS = [
    "chest pain", "chest tightness", "heart attack", "cardiac arrest",
    "difficulty breathing", "can't breathe", "cannot breathe", "shortness of breath",
    "loss of consciousness", "unconscious", "fainted", "passed out",
    "stroke", "face drooping", "arm weakness", "slurred speech",
    "severe abdominal pain", "appendicitis",
    "heavy bleeding", "uncontrolled bleeding", "haemorrhage", "hemorrhage",
    "poisoning", "overdose", "swallowed poison", "toxic",
    "severe allergic reaction", "anaphylaxis", "throat swelling", "lips swelling",
    "high fever", "103 fever", "104 fever", "105 fever", "seizure", "convulsion",
    "meningitis", "stiff neck with fever",
    "suicidal", "suicide", "self harm", "want to die",
]

# ─── High-Risk Patterns (flag for stronger disclaimer) ───────────────────────
HIGH_RISK_PATTERNS = [
    r"blood in (stool|urine|vomit|cough)",
    r"(sudden|severe|unbearable|worst) (pain|headache|stomach)",
    r"can'?t (breathe|walk|stand|move)",
    r"(infant|baby|newborn).*(fever|not eating|vomiting)",
    r"(pregnant|pregnancy).*(bleeding|pain|cramping|fever)",
    r"(diabetic|diabetes).*(wound|infection|foot)",
    r"(child|toddler|baby).*(swallowed|ate|ingested)",
    r"(burn|scald).*(large|severe|deep|third)",
]

# ─── Health-Related Keywords ─────────────────────────────────────────────────
HEALTH_KEYWORDS = [
    "pain", "ache", "hurt", "sore", "cramp", "headache", "fever", "cough",
    "cold", "flu", "infection", "rash", "skin", "hair", "stomach", "digestion",
    "nausea", "vomit", "constipation", "diarrhea", "period", "menstrual",
    "blood", "wound", "cut", "burn", "injury", "allergy", "medicine", "remedy",
    "treatment", "cure", "heal", "relief", "symptom", "illness", "disease",
    "sleep", "insomnia", "anxiety", "stress", "muscle", "joint", "bone", "eye",
    "throat", "breathing", "fatigue", "tired", "weak", "swelling",
    "pregnant", "baby", "infant", "child", "diabetes", "bp", "blood pressure",
]

EMERGENCY_RESPONSE = """⚠️ **This sounds like it could be a medical emergency.**

**Please seek immediate medical attention:**
- Call emergency services (112 in India, 911 in US/Canada)
- Go to the nearest emergency room
- Do not rely on home remedies for this situation

NaniBot preserves traditional household wisdom, but **cannot and should not** be used for emergency medical situations. Please get professional help immediately."""


def classify_risk(text: str) -> Tuple[str, bool, bool]:
    """
    Returns:
        risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
        is_health_related: bool
        is_emergency: bool
    """
    text_lower = text.lower()

    # Check for critical/emergency symptoms
    for symptom in CRITICAL_SYMPTOMS:
        if symptom in text_lower:
            return "CRITICAL", True, True

    # Check high-risk regex patterns
    for pattern in HIGH_RISK_PATTERNS:
        if re.search(pattern, text_lower):
            return "HIGH", True, False

    # Check if health-related
    health_match_count = sum(1 for kw in HEALTH_KEYWORDS if kw in text_lower)

    if health_match_count >= 3:
        return "MEDIUM", True, False
    elif health_match_count >= 1:
        return "LOW", True, False

    return "LOW", False, False


def get_safety_preamble(risk_level: str, is_health_related: bool) -> str:
    """Returns a safety note to prepend to health responses based on risk level."""
    if not is_health_related:
        return ""

    if risk_level == "HIGH":
        return (
            "> ⚠️ **Important**: The symptoms you've described may require professional medical evaluation. "
            "The traditional wisdom below is for general information only. If symptoms are severe or worsening, "
            "please consult a doctor.\n\n"
        )
    elif risk_level == "MEDIUM":
        return (
            "> 💙 **Note**: NaniBot shares traditional household wisdom, not medical advice. "
            "For persistent or concerning symptoms, always consult a qualified healthcare professional.\n\n"
        )
    return ""
