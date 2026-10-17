import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { ConfidenceValue } from "@/components/report/Confidence";
import { RetriedBadge } from "@/components/report/RetriedBadge";
import { SearchTrail } from "@/components/report/SearchTrail";
import { SourceList } from "@/components/report/SourceList";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/cn";
import { findKeptAttempt, plural, traceOf, verdictLine } from "@/lib/status";
import type { Claim } from "@/types";

function toggleLabel(isOpen: boolean, sources: number, hasTrace: boolean): string {
  if (isOpen) return hasTrace ? "Hide sources and agent steps" : "Hide sources";
  return hasTrace ? `Show ${plural(sources, "source")} and agent steps` : `Show ${plural(sources, "source")}`;
}

export function ClaimCard({ claim }: { claim: Claim }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const trace = traceOf(claim);
  const keptAttempt = findKeptAttempt(claim, trace);
  const hasTrace = trace.length > 0;
  const canExpand = hasTrace || claim.evidence.length > 0;

  return (
    <article id={`claim-${claim.id}`} className={cn("scroll-mt-20 rounded-lg border bg-surface", isOpen ? "border-line-strong" : "border-line")}>
      <div className="flex flex-col gap-2 px-5 pb-3.5 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h3 className="m-0 min-w-0 flex-[1_1_320px] text-[17px] font-semibold leading-snug">{claim.claim_text}</h3>
          {/* Above the claim text on phones. */}
          <div className="order-first flex flex-wrap gap-1.5 sm:order-none">
            <RetriedBadge attempts={trace.length} />
            <StatusBadge status={claim.status} />
          </div>
        </div>
        {claim.reasoning && <p className="m-0 text-[15px] leading-normal text-muted-foreground">{claim.reasoning}</p>}
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          {claim.status !== "unverified" && <span>Confidence</span>}
          <ConfidenceValue status={claim.status} confidence={claim.confidence_score} />
        </div>
      </div>

      {isOpen && (
        <div id={panelId} className="flex flex-col gap-[18px] border-t border-line bg-surface-2 px-4 pb-6 pt-5 sm:px-6">
          {hasTrace && (
            <>
              <h4 className="m-0 font-display text-lg font-bold">
                Agent search trail{" "}
                <span className="font-sans text-[15px] font-normal text-muted-foreground">· {plural(trace.length, "attempt")}</span>
              </h4>
              <SearchTrail
                trace={trace}
                keptAttempt={keptAttempt}
                verdict={verdictLine(claim.status, claim.confidence_score, keptAttempt)}
              />
            </>
          )}
          <h4 className="m-0 mt-1.5 font-display text-lg font-bold">
            Sources{" "}
            <span className="font-sans text-[15px] font-normal text-muted-foreground">
              · {claim.evidence.length}
              {keptAttempt !== null && `, from attempt ${keptAttempt}`}
            </span>
          </h4>
          <SourceList sources={claim.evidence} />
        </div>
      )}

      {canExpand && (
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          className="flex h-11 w-full items-center gap-2 rounded-b-lg border-t border-line bg-transparent px-5 text-sm font-semibold text-muted-foreground hover:text-ink"
        >
          {toggleLabel(isOpen, claim.evidence.length, hasTrace)}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}
