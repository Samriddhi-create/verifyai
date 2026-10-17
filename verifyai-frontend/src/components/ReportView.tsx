import { Plus } from "lucide-react";
import { useState } from "react";
import { ClaimCard } from "@/components/ClaimCard";
import { CheckedText } from "@/components/report/CheckedText";
import { HallucinationList } from "@/components/report/HallucinationList";
import { ScoreRing } from "@/components/report/ScoreRing";
import { StatusBreakdownBar } from "@/components/report/StatusBreakdownBar";
import { VerdictBanner, type RatedVerdict } from "@/components/report/VerdictBanner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { countByStatus, isFlagged, plural } from "@/lib/status";
import type { ClaimStatus, VerificationReport } from "@/types";

/** A plain-words summary under the verdict. It only counts claims; the verdict itself comes from the backend. */
function summarize(verdict: RatedVerdict, counts: Record<ClaimStatus, number>, total: number): string {
  const supported = `${counts.supported} of ${plural(total, "claim")} ${counts.supported === 1 ? "is" : "are"} supported.`;
  if (verdict === "unreliable") {
    const bad = counts.contradicted + counts.unverified;
    return `${bad} of ${plural(total, "claim")} ${bad === 1 ? "is" : "are"} contradicted or could not be confirmed. Don’t rely on this text without checking it yourself.`;
  }
  if (verdict === "reliable") return `${supported} None were contradicted by sources.`;

  const toCheck = [
    counts.contradicted > 0 && plural(counts.contradicted, "contradicted claim"),
    counts.unverified > 0 && plural(counts.unverified, "unconfirmed claim"),
    counts.partial > 0 && plural(counts.partial, "partly supported claim"),
  ].filter(Boolean) as string[];
  if (toCheck.length === 0) return supported;
  const list = toCheck.length === 1 ? toCheck[0] : `${toCheck.slice(0, -1).join(", ")} and ${toCheck[toCheck.length - 1]}`;
  return `${supported} Check the ${list} before you use this text.`;
}

function ScoreCard({ report, verdict, score }: { report: VerificationReport; verdict: RatedVerdict; score: number }) {
  const counts = countByStatus(report.claims);
  return (
    <section
      aria-labelledby="score-heading"
      className="flex min-w-0 flex-[1.25_1_480px] flex-col items-center gap-9 rounded-lg border border-line bg-surface p-6 text-center sm:flex-row sm:flex-wrap sm:text-left"
    >
      <ScoreRing score={score} />
      <div className="flex w-full min-w-0 flex-[1_1_200px] flex-col gap-3.5">
        <h2 id="score-heading" className="text-sm font-medium text-muted-foreground">
          Trust score
        </h2>
        <VerdictBanner verdict={verdict} />
        <p className="m-0 text-[15px] leading-normal text-muted-foreground">{summarize(verdict, counts, report.claims.length)}</p>
        <StatusBreakdownBar counts={counts} />
      </div>
    </section>
  );
}

export function ReportView({ report, onNewCheck }: { report: VerificationReport; onNewCheck: () => void }) {
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  const total = report.claims.length;
  const flagged = report.claims.filter((claim) => isFlagged(claim.status));
  const shown = filter === "flagged" ? flagged : report.claims;

  // Reports cached before the API sent a verdict lack these fields.
  const verdict = report.verdict && report.verdict !== "no_claims" ? report.verdict : null;
  const score = typeof report.trust_score === "number" ? report.trust_score : null;
  const alerts = report.alerts ?? [];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[28px]">Verification report</h1>
          <p className="text-sm text-muted-foreground">{plural(total, "claim")} checked against the live web</p>
        </div>
        <Button onClick={onNewCheck}>
          <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          New check
        </Button>
      </header>

      <CheckedText text={report.original_text} claims={report.claims} />

      {total === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-6 text-[15px] text-muted-foreground">
          No verifiable claims were found in this text.
        </p>
      ) : (
        <>
          {(verdict && score !== null) || alerts.length > 0 ? (
            <div className="flex flex-wrap items-stretch gap-4">
              {verdict && score !== null && <ScoreCard report={report} verdict={verdict} score={score} />}
              <HallucinationList alerts={alerts} urgent={verdict === "unreliable"} />
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold sm:text-[21px]">
              Claims <span className="font-mono text-[15px] font-normal text-muted-foreground">{total}</span>
            </h2>
            {flagged.length > 0 && (
              <div role="group" aria-label="Filter claims" className="flex gap-0.5 rounded-lg border border-line bg-surface p-[3px]">
                {(
                  [
                    ["all", "All"],
                    ["flagged", `Flagged ${flagged.length}`],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                    className={cn(
                      "h-11 rounded-tile px-3.5 text-sm",
                      filter === value ? "bg-surface-2 font-semibold text-ink" : "font-medium text-muted-foreground hover:text-ink"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {shown.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
