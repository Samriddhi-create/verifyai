import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { EvidenceList } from "@/components/EvidenceList";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Claim } from "@/types";
import { cn } from "@/lib/cn";

export function ClaimCard({ claim }: { claim: Claim }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{claim.claim_text}</p>
          <StatusBadge status={claim.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {claim.reasoning && <p className="text-xs text-muted-foreground">{claim.reasoning}</p>}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Confidence</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/60"
              style={{ width: `${Math.round(claim.confidence_score * 100)}%` }}
            />
          </div>
          <span>{Math.round(claim.confidence_score * 100)}%</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {isOpen ? "Hide" : "Show"} {claim.evidence.length} source{claim.evidence.length === 1 ? "" : "s"}
          <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
        </button>

        {isOpen && <EvidenceList evidence={claim.evidence} />}
      </CardContent>
    </Card>
  );
}
