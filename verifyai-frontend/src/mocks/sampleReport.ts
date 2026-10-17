// INVENTED SAMPLE DATA FOR UI DESIGN ONLY. Nothing here was produced by a real
// verification: the claims, sources, URLs and scores are made up. It must never
// be presented to anyone as a real result. It is served only when
// VITE_MOCK_API=true (see src/lib/api.ts).

import type {
  Claim,
  ClaimStatus,
  HallucinationAlert,
  Verdict,
  VerificationReport,
} from "@/types";

// The functions below mirror compute_trust_score, compute_verdict and the
// alerts property in verifyai-backend/app/models/verification.py, so the sample
// has the exact shape and values the real API would return for these claims.

const CLAIM_POINTS: Record<ClaimStatus, number> = {
  supported: 1.0,
  partial: 0.5,
  unverified: 0.25,
  contradicted: 0.0,
};
const RELIABLE_MIN_SCORE = 75;
const UNRELIABLE_MAX_SCORE = 40;
const UNRELIABLE_CONTRADICTED_SHARE = 0.5;

function computeTrustScore(statuses: ClaimStatus[]): number | null {
  if (statuses.length === 0) return null;
  const average = statuses.reduce((sum, status) => sum + CLAIM_POINTS[status], 0) / statuses.length;
  return Math.floor(average * 100 + 0.5);
}

function computeVerdict(statuses: ClaimStatus[]): Verdict {
  const score = computeTrustScore(statuses);
  if (score === null) return "no_claims";
  const contradicted = statuses.filter((status) => status === "contradicted").length;
  if (score < UNRELIABLE_MAX_SCORE || contradicted / statuses.length > UNRELIABLE_CONTRADICTED_SHARE) {
    return "unreliable";
  }
  if (contradicted > 0 || score < RELIABLE_MIN_SCORE) return "mixed";
  return "reliable";
}

function computeAlerts(claims: Claim[]): HallucinationAlert[] {
  const alerts: HallucinationAlert[] = [];
  for (const claim of claims) {
    if (claim.status === "contradicted") {
      alerts.push({
        claim_id: claim.id,
        claim_text: claim.claim_text,
        severity: "high",
        message: "Sources contradict this claim. It may be made up.",
      });
    } else if (claim.status === "unverified") {
      alerts.push({
        claim_id: claim.id,
        claim_text: claim.claim_text,
        severity: "medium",
        message: "No source confirms this claim. Unsupported details are a common sign of hallucination.",
      });
    }
  }
  // Array.prototype.sort is stable, matching Python's sort: high first, otherwise claim order.
  return alerts.sort((a, b) => Number(a.severity !== "high") - Number(b.severity !== "high"));
}

const ORIGINAL_TEXT =
  "The Great Barrier Reef is the world's largest coral reef system, stretching over 2,300 kilometres " +
  "along the coast of Queensland, Australia. It was designated a UNESCO World Heritage Site in 1981. " +
  "Roughly half of its coral cover has been lost since the 1990s, mostly due to bleaching. The reef is " +
  "visible from the Moon with the naked eye. In 2022, the Australian Institute of Marine Science reported " +
  "the highest coral cover in the northern reef in 36 years of monitoring.";

const CLAIMS: Claim[] = [
  {
    id: "3f6c1a2e-8b4d-4c1e-9a7f-1d2b3c4e5f60",
    claim_text:
      "The Great Barrier Reef stretches over 2,300 kilometres along the coast of Queensland, Australia.",
    status: "supported",
    evidence: [
      {
        url: "https://example.org/reef-facts",
        title: "Great Barrier Reef: facts and figures",
        snippet: "The reef extends for more than 2,300 km along the Queensland coastline and covers about 344,400 square kilometres.",
        source_name: "example.org",
        published_date: "2024-03-12",
      },
      {
        url: "https://example.com/encyclopedia/great-barrier-reef",
        title: "Great Barrier Reef | Encyclopedia entry",
        snippet: "The world's largest coral reef system, stretching for over 2,300 kilometres off Queensland, Australia.",
        source_name: "example.com",
        published_date: null,
      },
    ],
    confidence_score: 0.94,
    reasoning: "Two reference sources give the reef's length as more than 2,300 km along the Queensland coast.",
    trace: [
      {
        attempt: 1,
        query:
          "The Great Barrier Reef stretches over 2,300 kilometres along the coast of Queensland, Australia.",
        sources_found: 2,
        status: "supported",
        confidence_score: 0.94,
      },
    ],
  },
  {
    id: "a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
    claim_text: "Roughly half of the Great Barrier Reef's coral cover has been lost since the 1990s, mostly due to bleaching.",
    status: "partial",
    evidence: [
      {
        url: "https://example.net/news/reef-coral-decline-study",
        title: "Study finds reef lost half its corals in three decades",
        snippet: "Researchers found coral populations declined by more than 50% between 1995 and 2017, with bleaching a major driver alongside storms and starfish outbreaks.",
        source_name: "example.net",
        published_date: "2020-10-14",
      },
    ],
    confidence_score: 0.72,
    reasoning:
      "A study reports a decline of over 50% since 1995, but it credits storms and starfish outbreaks as well as bleaching, so \"mostly due to bleaching\" is only partly backed.",
    trace: [
      {
        attempt: 1,
        query: "Roughly half of the Great Barrier Reef's coral cover has been lost since the 1990s, mostly due to bleaching.",
        sources_found: 1,
        status: "partial",
        confidence_score: 0.72,
      },
    ],
  },
  {
    id: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b1a",
    claim_text: "The Great Barrier Reef is visible from the Moon with the naked eye.",
    status: "contradicted",
    evidence: [
      {
        url: "https://example.org/space/myths-seen-from-space",
        title: "What can you really see from space?",
        snippet: "The reef can be seen from low Earth orbit, but no structure on Earth is visible to the naked eye from the Moon, about 384,000 km away.",
        source_name: "example.org",
        published_date: "2023-06-01",
      },
    ],
    confidence_score: 0.88,
    reasoning: "The source says the reef is visible from low orbit but that nothing on Earth can be seen with the naked eye from the Moon.",
    trace: [
      {
        attempt: 1,
        query: "The Great Barrier Reef is visible from the Moon with the naked eye.",
        sources_found: 1,
        status: "contradicted",
        confidence_score: 0.88,
      },
    ],
  },
  {
    id: "9e8d7c6b-5a4f-4e3d-2c1b-0a9f8e7d6c5b",
    claim_text:
      "In 2022, the Australian Institute of Marine Science reported the highest coral cover in the northern Great Barrier Reef in 36 years of monitoring.",
    status: "supported",
    evidence: [
      {
        url: "https://example.com/reports/annual-reef-monitoring-2022",
        title: "Annual summary report on coral reef condition 2021/22",
        snippet: "Hard coral cover in the northern region reached 36%, the highest level recorded in the 36 years of AIMS long-term monitoring.",
        source_name: "example.com",
        published_date: "2022-08-04",
      },
      {
        url: "https://example.net/news/northern-reef-record-coral",
        title: "Northern reef records highest coral cover since monitoring began",
        snippet: "The Australian Institute of Marine Science said coral cover in the north and centre of the reef was at its highest in 36 years.",
        source_name: "example.net",
        published_date: "2022-08-04",
      },
    ],
    confidence_score: 0.86,
    reasoning:
      "The 2021/22 monitoring summary and news coverage both report record-high coral cover in the northern reef across 36 years of AIMS monitoring.",
    trace: [
      {
        attempt: 1,
        query:
          "In 2022, the Australian Institute of Marine Science reported the highest coral cover in the northern Great Barrier Reef in 36 years of monitoring.",
        sources_found: 2,
        status: "unverified",
        confidence_score: 0.3,
      },
      {
        attempt: 2,
        query: "AIMS 2022 northern reef coral cover record",
        sources_found: 3,
        status: "partial",
        confidence_score: 0.55,
      },
      {
        attempt: 3,
        query: "AIMS annual summary report coral reef condition 2021/22 northern region",
        sources_found: 2,
        status: "supported",
        confidence_score: 0.86,
      },
    ],
  },
];

const statuses = CLAIMS.map((claim) => claim.status);

export const sampleReport: VerificationReport = {
  id: "0b1c2d3e-4f50-4617-8293-a4b5c6d7e8f9",
  user_id: null,
  original_text: ORIGINAL_TEXT,
  source_url: null,
  claims: CLAIMS,
  // Same naive-UTC format the backend's datetime.utcnow() serializes to.
  created_at: "2026-10-17T09:30:00.000000",
  trust_score: computeTrustScore(statuses),
  verdict: computeVerdict(statuses),
  alerts: computeAlerts(CLAIMS),
};

export const sampleFollowUpAnswer =
  "This is a canned demo answer, not a real response. In mock mode no question is sent to the model, so use this text only to check how answers look in the chat panel.";
