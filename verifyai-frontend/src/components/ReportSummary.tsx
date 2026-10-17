import { AlertTriangle, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ClaimStatus, VerificationReport, Verdict } from "@/types";

const STATUS_ORDER: ClaimStatus[] = ["supported", "partial", "contradicted", "unverified"];
const STATUS_COLOR: Record<ClaimStatus, string> = {
  supported: "bg-supported",
  partial: "bg-partial",
  contradicted: "bg-contradicted",
  unverified: "bg-unverified",
};
const STATUS_LABEL: Record<ClaimStatus, string> = {
  supported: "Supported",
  partial: "Partial",
  contradicted: "Contradicted",
  unverified: "Unverified",
};

type RatedVerdict = Exclude<Verdict, "no_claims">;

const VERDICT_CONFIG: Record<RatedVerdict, { title: string; description: string; text: string; icon: LucideIcon }> = {
  reliable: {
    title: "Looks reliable",
    description: "Sources back up most of the claims in this text, and none of them were contradicted.",
    text: "text-supported",
    icon: ShieldCheck,
  },
  mixed: {
    title: "Mixed reliability",
    description:
      "Some claims check out, but others are only partly supported, unconfirmed or contradicted. Check the flagged claims before relying on this text.",
    text: "text-partial",
    icon: AlertTriangle,
  },
  unreliable: {
    title: "Unreliable",
    description:
      "Many claims are contradicted or could not be confirmed by any source. Don't rely on this text without checking it yourself.",
    text: "text-contradicted",
    icon: ShieldAlert,
  },
};

const RING_RADIUS = 30;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function TrustScoreRing({ score, colorClass }: { score: number; colorClass: string }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="relative h-20 w-20 shrink-0" role="img" aria-label={`Trust score: ${clamped} out of 100`}>
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="6" className="stroke-muted" />
        <circle
          cx="36"
          cy="36"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - clamped / 100)}
          className={cn("transition-[stroke-dashoffset] duration-500", colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="text-xl font-bold leading-none">{clamped}</span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function ReportSummary({ report }: { report: VerificationReport }) {
  const counts = report.claims.reduce(
    (acc, claim) => {
      acc[claim.status] += 1;
      return acc;
    },
    { supported: 0, partial: 0, contradicted: 0, unverified: 0 } as Record<ClaimStatus, number>
  );
  const total = report.claims.length;

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No verifiable claims were found in this text.</p>;
  }

  // Reports cached before the API returned a verdict have neither field, so
  // they fall back to the breakdown alone.
  const verdict = report.verdict && report.verdict !== "no_claims" ? VERDICT_CONFIG[report.verdict] : null;
  const score = typeof report.trust_score === "number" ? report.trust_score : null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4">
        {verdict && score !== null && (
          <div className="flex items-center gap-4">
            <TrustScoreRing score={score} colorClass={verdict.text} />
            <div className="flex min-w-0 flex-col gap-1" role="status">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Trust score</p>
              <h2 className={cn("flex items-center gap-1.5 text-base font-semibold leading-tight", verdict.text)}>
                <verdict.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {verdict.title}
              </h2>
              <p className="text-xs text-muted-foreground">{verdict.description}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            {STATUS_ORDER.map((status) =>
              counts[status] > 0 ? (
                <div
                  key={status}
                  className={STATUS_COLOR[status]}
                  style={{ width: `${(counts[status] / total) * 100}%` }}
                  title={`${STATUS_LABEL[status]}: ${counts[status]}`}
                />
              ) : null
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {STATUS_ORDER.map((status) => (
              <span key={status} className="inline-flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${STATUS_COLOR[status]}`} />
                {STATUS_LABEL[status]} ({counts[status]})
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
