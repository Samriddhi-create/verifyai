import pytest

from app.models.verification import (
    AlertSeverity,
    Claim,
    ClaimStatus,
    Verdict,
    VerificationReport,
    compute_trust_score,
    compute_verdict,
)

S, P, C, U = ClaimStatus.SUPPORTED, ClaimStatus.PARTIAL, ClaimStatus.CONTRADICTED, ClaimStatus.UNVERIFIED


def _report(*statuses: ClaimStatus) -> VerificationReport:
    claims = [
        Claim(claim_text=f"Claim {i}", status=status, evidence=[], confidence_score=0.9)
        for i, status in enumerate(statuses)
    ]
    return VerificationReport(original_text="text", claims=claims)


def test_no_claims_has_no_score():
    assert compute_trust_score([]) is None
    assert compute_verdict([]) is Verdict.NO_CLAIMS


@pytest.mark.parametrize(
    ("statuses", "score"),
    [
        ([S, S, S], 100),
        ([S, P], 75),
        ([S, C], 50),
        ([C, C], 0),
        ([U, U, U, U], 25),
        ([S, S, S, S, S, C], 83),
    ],
)
def test_trust_score_weights_each_status(statuses, score):
    assert compute_trust_score(statuses) == score


@pytest.mark.parametrize(
    ("statuses", "verdict"),
    [
        ([S, S, S, S], Verdict.RELIABLE),
        ([S, S, S, P], Verdict.RELIABLE),
        ([S, P, P], Verdict.MIXED),
        ([S, S, S, S, S, C], Verdict.MIXED),  # one made-up fact keeps it out of "reliable"
        ([S, C], Verdict.MIXED),
        ([S, C, C], Verdict.UNRELIABLE),
        ([C, C], Verdict.UNRELIABLE),
        ([U, U, U], Verdict.UNRELIABLE),
    ],
)
def test_verdict_thresholds(statuses, verdict):
    assert compute_verdict(statuses) is verdict


def test_report_exposes_score_verdict_and_alerts_in_json():
    body = _report(S, C, U).model_dump(mode="json")

    assert body["trust_score"] == 42
    assert body["verdict"] == "mixed"
    assert [alert["severity"] for alert in body["alerts"]] == ["high", "medium"]


def test_alerts_flag_contradicted_before_unverified_and_skip_verified_claims():
    report = _report(U, S, C, P)

    alerts = report.alerts

    assert [alert.claim_text for alert in alerts] == ["Claim 2", "Claim 0"]
    assert alerts[0].severity is AlertSeverity.HIGH
    assert alerts[1].severity is AlertSeverity.MEDIUM


def test_clean_report_has_no_alerts():
    assert _report(S, S).alerts == []
