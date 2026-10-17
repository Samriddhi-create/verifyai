import { ChevronDown, RotateCw } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { AgentTrace } from "@/components/AgentTrace";
import { EvidenceList } from "@/components/EvidenceList";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Claim } from "@/types";
import { cn } from "@/lib/cn";

function Disclosure({ label, children }: { label: (isOpen: boolean) => string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        {label(isOpen)}
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
      </button>
      <div id={panelId} hidden={!isOpen}>
        {isOpen && children}
      </div>
    </>
  );
}

export function ClaimCard({ claim }: { claim: Claim }) {
  // Reports saved before the agent loop existed have no trace.
  const trace = claim.trace ?? [];
  const retries = trace.length - 1;
  const confidencePercent = Math.round(claim.confidence_score * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{claim.claim_text}</p>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            {retries > 0 && (
              <Badge variant="secondary" aria-label={`The agent retried this search ${retries} time${retries === 1 ? "" : "s"}`}>
                <RotateCw className="h-3 w-3" aria-hidden="true" />
                Retried {retries}x
              </Badge>
            )}
            <StatusBadge status={claim.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {claim.reasoning && <p className="text-xs text-muted-foreground">{claim.reasoning}</p>}
        {claim.status === "unverified" ? (
          // A confidence figure on an unverified claim reads as contradictory, so it's left out.
          <p className="text-[10px] text-muted-foreground">No evidence found</p>
        ) : (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Confidence</span>
            <div
              className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"
              role="meter"
              aria-label="Confidence"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={confidencePercent}
            >
              <div className="h-full rounded-full bg-foreground/60" style={{ width: `${confidencePercent}%` }} />
            </div>
            <span aria-hidden="true">{confidencePercent}%</span>
          </div>
        )}

        <Disclosure
          label={(isOpen) =>
            `${isOpen ? "Hide" : "Show"} ${claim.evidence.length} source${claim.evidence.length === 1 ? "" : "s"}`
          }
        >
          <EvidenceList evidence={claim.evidence} />
        </Disclosure>

        {trace.length > 0 && (
          <Disclosure label={(isOpen) => `${isOpen ? "Hide" : "Show"} agent steps (${trace.length})`}>
            <AgentTrace claim={claim} trace={trace} />
          </Disclosure>
        )}
      </CardContent>
    </Card>
  );
}
