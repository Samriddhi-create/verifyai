from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, computed_field, field_validator


class ClaimStatus(str, Enum):
    SUPPORTED = "supported"
    PARTIAL = "partial"
    CONTRADICTED = "contradicted"
    UNVERIFIED = "unverified"


class Verdict(str, Enum):
    RELIABLE = "reliable"
    MIXED = "mixed"
    UNRELIABLE = "unreliable"
    NO_CLAIMS = "no_claims"


class AlertSeverity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"


# How much each claim status counts toward the 0-100 trust score. A claim
# nobody could confirm still earns a little (it may just be obscure) but far
# less than a confirmed one; a contradicted claim earns nothing.
_CLAIM_POINTS: dict[ClaimStatus, float] = {
    ClaimStatus.SUPPORTED: 1.0,
    ClaimStatus.PARTIAL: 0.5,
    ClaimStatus.UNVERIFIED: 0.25,
    ClaimStatus.CONTRADICTED: 0.0,
}
_RELIABLE_MIN_SCORE = 75
_UNRELIABLE_MAX_SCORE = 40
_UNRELIABLE_CONTRADICTED_SHARE = 0.5


def compute_trust_score(statuses: Sequence[ClaimStatus]) -> int | None:
    if not statuses:
        return None
    average = sum(_CLAIM_POINTS[status] for status in statuses) / len(statuses)
    return int(average * 100 + 0.5)


def compute_verdict(statuses: Sequence[ClaimStatus]) -> Verdict:
    score = compute_trust_score(statuses)
    if score is None:
        return Verdict.NO_CLAIMS

    contradicted = sum(1 for status in statuses if status is ClaimStatus.CONTRADICTED)
    if score < _UNRELIABLE_MAX_SCORE or contradicted / len(statuses) > _UNRELIABLE_CONTRADICTED_SHARE:
        return Verdict.UNRELIABLE
    # One fabricated fact is enough to keep a text out of "reliable", however
    # many other claims check out.
    if contradicted > 0 or score < _RELIABLE_MIN_SCORE:
        return Verdict.MIXED
    return Verdict.RELIABLE


class EvidenceSnippet(BaseModel):
    url: str
    title: str
    snippet: str
    source_name: str | None = None
    published_date: str | None = None


class AgentAttempt(BaseModel):
    """One search-and-judge round the agent performed for a claim."""

    attempt: int
    query: str
    sources_found: int
    status: ClaimStatus
    confidence_score: float = Field(ge=0.0, le=1.0)


class Claim(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    claim_text: str
    status: ClaimStatus
    evidence: list[EvidenceSnippet] = Field(default_factory=list)
    confidence_score: float = Field(ge=0.0, le=1.0)
    reasoning: str | None = None
    trace: list[AgentAttempt] = Field(default_factory=list)


class HallucinationAlert(BaseModel):
    claim_id: UUID
    claim_text: str
    severity: AlertSeverity
    message: str


class VerifyRequest(BaseModel):
    text: str = Field(min_length=1)
    source_url: str | None = None

    @field_validator("text")
    @classmethod
    def strip_text(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("text must not be empty or whitespace-only")
        return stripped


class VerificationReport(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID | None = None
    original_text: str
    source_url: str | None = None
    claims: list[Claim]
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def summary(self) -> dict[str, int]:
        counts = {status.value: 0 for status in ClaimStatus}
        for claim in self.claims:
            counts[claim.status.value] += 1
        return counts

    @computed_field
    @property
    def trust_score(self) -> int | None:
        return compute_trust_score([claim.status for claim in self.claims])

    @computed_field
    @property
    def verdict(self) -> Verdict:
        return compute_verdict([claim.status for claim in self.claims])

    @computed_field
    @property
    def alerts(self) -> list[HallucinationAlert]:
        """Claims that look made up: contradicted by sources, or not confirmed by any."""
        alerts: list[HallucinationAlert] = []
        for claim in self.claims:
            if claim.status is ClaimStatus.CONTRADICTED:
                severity, message = AlertSeverity.HIGH, "Sources contradict this claim. It may be made up."
            elif claim.status is ClaimStatus.UNVERIFIED:
                severity, message = AlertSeverity.MEDIUM, "No source confirms this claim. Unsupported details are a common sign of hallucination."
            else:
                continue
            alerts.append(
                HallucinationAlert(claim_id=claim.id, claim_text=claim.claim_text, severity=severity, message=message)
            )
        # High-severity first, otherwise keep the order the claims appeared in.
        alerts.sort(key=lambda alert: alert.severity is not AlertSeverity.HIGH)
        return alerts


class VerificationSummary(BaseModel):
    """Lightweight shape used in history listings."""

    id: UUID
    original_text: str
    claim_count: int
    summary: dict[str, int]
    trust_score: int | None = None
    verdict: Verdict = Verdict.NO_CLAIMS
    created_at: datetime


class HistoryResponse(BaseModel):
    items: list[VerificationSummary]
    total: int
