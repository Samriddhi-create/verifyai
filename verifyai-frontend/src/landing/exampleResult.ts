// A real result from a check run on the live site on 18 October 2026, as
// reported by the team. Only the facts below were recorded; nothing here is
// estimated or filled in. Update it from a new real run, never by hand-editing
// the numbers.

import type { AlertSeverity, ClaimStatus, Verdict } from "@/types";

export interface ExampleAttempt {
  attempt: number;
  query: string;
  sourcesFound: number;
  status: ClaimStatus;
  /** Not shown for unverified attempts, which display "No evidence found". */
  confidence: number | null;
}

export const EXAMPLE_RESULT = {
  label: "A real result from VerifyAI, 18 October 2026",
  checkedText:
    "The Eiffel Tower was completed in 1889. The Great Wall of China is visible from space with the naked eye. " +
    "The Australian Institute of Marine Science reported record-high coral cover in the northern Great Barrier Reef in 2022.",
  trustScore: 67,
  verdict: "mixed" as const satisfies Verdict,
  counts: { supported: 2, partial: 0, contradicted: 1, unverified: 0 } satisfies Record<ClaimStatus, number>,
  alert: {
    claim: "The Great Wall of China is visible from space with the naked eye.",
    severity: "high" as const satisfies AlertSeverity,
    message: "Sources contradict this claim. It may be made up.",
  },
  /** The search trail shown for the flagged claim. */
  trail: {
    claim: "The Great Wall of China is visible from space with the naked eye.",
    keptAttempt: 1,
    attempts: [
      {
        attempt: 1,
        query: "The Great Wall of China is visible from space with the naked eye.",
        sourcesFound: 5,
        status: "contradicted" as const,
        confidence: 0.98,
      },
    ] satisfies ExampleAttempt[],
  },
};
