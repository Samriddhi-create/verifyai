// A real result from a check run on the live site on 17 October 2026, as
// reported by the team. Only the facts below were recorded; nothing here is
// estimated or filled in. Update it from a new real run, never by hand-editing
// the numbers.

import type { ClaimStatus, Verdict } from "@/types";

export interface ExampleAttempt {
  attempt: number;
  query: string;
  sourcesFound: number;
  status: ClaimStatus;
  /** Not recorded for unverified attempts, which show "No evidence found". */
  confidence: number | null;
}

export const EXAMPLE_RESULT = {
  label: "A real result from VerifyAI, 17 October 2026",
  claim: "The Tuvalu national football team won exactly three international matches in 1987.",
  trustScore: 0,
  verdict: "unreliable" satisfies Verdict,
  hallucination: { severity: "High", status: "contradicted" as ClaimStatus, confidence: 0.85 },
  keptAttempt: 2,
  attempts: [
    {
      attempt: 1,
      query: "The Tuvalu national football team won exactly three international matches in 1987.",
      sourcesFound: 5,
      status: "unverified",
      confidence: null,
    },
    {
      attempt: 2,
      query: "Tuvalu 1987 international football match results RSSSF",
      sourcesFound: 5,
      status: "contradicted",
      confidence: 0.85,
    },
  ] satisfies ExampleAttempt[],
};
