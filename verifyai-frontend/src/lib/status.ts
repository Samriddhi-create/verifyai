import { CircleCheck, CircleHelp, CircleX, TriangleAlert, type LucideIcon } from "lucide-react";
import type { AgentAttempt, Claim, ClaimStatus } from "@/types";

export const STATUS_ORDER: ClaimStatus[] = ["supported", "partial", "contradicted", "unverified"];

// Class names are written out in full so Tailwind can find them.
export const STATUS_META: Record<
  ClaimStatus,
  { label: string; icon: LucideIcon; fill: string; soft: string; ink: string }
> = {
  supported: { label: "Supported", icon: CircleCheck, fill: "bg-supported", soft: "bg-supported-soft", ink: "text-supported-ink" },
  partial: { label: "Partial", icon: TriangleAlert, fill: "bg-partial", soft: "bg-partial-soft", ink: "text-partial-ink" },
  contradicted: { label: "Contradicted", icon: CircleX, fill: "bg-contradicted", soft: "bg-contradicted-soft", ink: "text-contradicted-ink" },
  unverified: { label: "Unverified", icon: CircleHelp, fill: "bg-unverified", soft: "bg-unverified-soft", ink: "text-unverified-ink" },
};

/** Contradicted and unverified claims are the ones the backend raises alerts for. */
export function isFlagged(status: ClaimStatus): boolean {
  return status === "contradicted" || status === "unverified";
}

export function countByStatus(claims: Claim[]): Record<ClaimStatus, number> {
  const counts: Record<ClaimStatus, number> = { supported: 0, partial: 0, contradicted: 0, unverified: 0 };
  for (const claim of claims) counts[claim.status] += 1;
  return counts;
}

export function percent(confidence: number): number {
  return Math.round(Math.max(0, Math.min(1, confidence)) * 100);
}

const CONFIDENCE_EPSILON = 1e-6;

/**
 * The API doesn't say which attempt was kept. The backend returns the best
 * attempt's status and confidence as the claim's result and keeps the earliest
 * one on a tie, so the first attempt that matches them is the kept one.
 */
export function findKeptAttempt(claim: Claim, trace: AgentAttempt[]): number | null {
  const kept = trace.find(
    (attempt) =>
      attempt.status === claim.status && Math.abs(attempt.confidence_score - claim.confidence_score) < CONFIDENCE_EPSILON
  );
  return kept ? kept.attempt : null;
}

/** Older saved reports have no trace. */
export function traceOf(claim: Claim): AgentAttempt[] {
  return claim.trace ?? [];
}

/** One sentence for the trail's final node, built only from the result's facts. */
export function verdictLine(status: ClaimStatus, confidence: number, keptAttempt: number | null): string {
  const label = STATUS_META[status].label;
  const result = status === "unverified" ? `${label}, no evidence found` : `${label} at ${percent(confidence)}% confidence`;
  return keptAttempt === null ? `${result}.` : `${result}, kept from attempt ${keptAttempt}.`;
}

export function domainOf(url: string, sourceName: string | null): string {
  if (sourceName) return sourceName;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function plural(count: number, word: string, pluralWord = `${word}s`): string {
  return `${count} ${count === 1 ? word : pluralWord}`;
}
