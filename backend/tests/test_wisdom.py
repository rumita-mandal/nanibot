import pytest
from app.schemas.wisdom import EVIDENCE_LABELS


def test_evidence_labels_mapping():
    assert "well_supported" in EVIDENCE_LABELS
    assert EVIDENCE_LABELS["well_supported"].label == "Well Supported"
    assert EVIDENCE_LABELS["potentially_unsafe"].color == "red"
