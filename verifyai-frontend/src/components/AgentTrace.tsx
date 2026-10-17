import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/cn";
import type { AgentAttempt, Claim } from "@/types";

const CONFIDENCE_EPSILON = 1e-6;

/**
 * The backend returns the best attempt's status and confidence as the claim's
 * result, keeping the earliest one on a tie, so the first attempt that matches
 * them is the one that was kept.
 */
function findKeptAttempt(claim: Claim, trace: AgentAttempt[]): number | null {
  const kept = trace.find(
    (attempt) =>
      attempt.status === claim.status && Math.abs(attempt.confidence_score - claim.confidence_score) < CONFIDENCE_EPSILON
  );
  return kept ? kept.attempt : null;
}

export function AgentTrace({ claim, trace }: { claim: Claim; trace: AgentAttempt[] }) {
  const keptAttempt = findKeptAttempt(claim, trace);

  return (
    <ol className="flex flex-col" aria-label="Agent search attempts">
      {trace.map((attempt, index) => {
        const isKept = attempt.attempt === keptAttempt;
        const isLast = index === trace.length - 1;
        return (
          <li key={attempt.attempt} className="relative flex gap-3 pb-2 last:pb-0">
            {/* Timeline rail and node. */}
            <div className="flex w-5 shrink-0 flex-col items-center" aria-hidden="true">
              <span
                className={cn(
                  "z-10 mt-2 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                  isKept ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
                )}
              >
                {attempt.attempt}
              </span>
              {!isLast && <span className="-mb-2 mt-1 w-px flex-1 bg-border" />}
            </div>

            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-1.5 rounded-md border p-2",
                isKept ? "border-primary/60 bg-accent/60" : "border-border bg-background"
              )}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs font-medium">Attempt {attempt.attempt}</span>
                {isKept && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Kept result
                  </span>
                )}
                <span className="ml-auto">
                  <StatusBadge status={attempt.status} />
                </span>
              </div>
              <p className="break-words text-xs text-muted-foreground">
                <span className="sr-only">Search query: </span>
                <span aria-hidden="true" className="mr-1 font-medium text-foreground/70">
                  Query
                </span>
                &ldquo;{attempt.query}&rdquo;
              </p>
              <p className="flex flex-wrap gap-x-3 text-[10px] text-muted-foreground">
                <span>
                  {attempt.sources_found} source{attempt.sources_found === 1 ? "" : "s"} found
                </span>
                {attempt.status !== "unverified" && (
                  <span>Confidence {Math.round(attempt.confidence_score * 100)}%</span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
