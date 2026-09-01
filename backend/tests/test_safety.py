from app.services.safety import classify_risk, get_safety_preamble


def test_safety_critical_symptoms():
    risk, is_health, is_emergency = classify_risk("I have severe chest pain and difficulty breathing")
    assert risk == "CRITICAL"
    assert is_health is True
    assert is_emergency is True


def test_safety_high_risk_patterns():
    risk, is_health, is_emergency = classify_risk("There is sudden severe pain in my stomach")
    assert risk == "HIGH"
    assert is_health is True
    assert is_emergency is False


def test_safety_medium_risk():
    risk, is_health, is_emergency = classify_risk("What can I do for a mild fever, cough, and stomach pain?")
    assert risk == "MEDIUM"
    assert is_health is True
    assert is_emergency is False


def test_safety_non_health():
    risk, is_health, is_emergency = classify_risk("How do I clean stains from my shirt?")
    assert is_health is False
    assert is_emergency is False


def test_safety_preamble():
    assert "Important" in get_safety_preamble("HIGH", True)
    assert "Note" in get_safety_preamble("MEDIUM", True)
    assert get_safety_preamble("LOW", False) == ""
