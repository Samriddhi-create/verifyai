import type { ClaimStatus, Verdict, VerificationReport } from "@/types";

export type Tone = "supported" | "partial" | "contradicted" | "unverified";

interface VerdictCopy {
  label: string;
  tone: Tone;
}

export const VERDICTS: Record<Verdict, VerdictCopy> = {
  reliable: { label: "Looks accurate", tone: "supported" },
  mixed: { label: "Some claims need review", tone: "partial" },
  unreliable: { label: "Likely inaccurate", tone: "contradicted" },
  no_claims: { label: "No checkable claims", tone: "unverified" },
};

// Full class names, so Tailwind can see them at build time.
export const TONE_DOT: Record<Tone, string> = {
  supported: "bg-supported",
  partial: "bg-partial",
  contradicted: "bg-contradicted",
  unverified: "bg-unverified",
};

export const STATUS_ORDER: ClaimStatus[] = ["supported", "partial", "contradicted", "unverified"];

export const STATUS_LABEL: Record<ClaimStatus, string> = {
  supported: "Supported",
  partial: "Partial",
  contradicted: "Contradicted",
  unverified: "Unverified",
};

export function countByStatus(report: VerificationReport): Record<ClaimStatus, number> {
  const counts: Record<ClaimStatus, number> = { supported: 0, partial: 0, contradicted: 0, unverified: 0 };
  for (const claim of report.claims) {
    counts[claim.status] += 1;
  }
  return counts;
}

export function describeReport(report: VerificationReport): string {
  const total = report.claims.length;
  if (total === 0) return "Nothing in this text can be fact-checked.";
  const supported = countByStatus(report).supported;
  return `${supported} of ${total} ${total === 1 ? "claim" : "claims"} confirmed by sources`;
}
