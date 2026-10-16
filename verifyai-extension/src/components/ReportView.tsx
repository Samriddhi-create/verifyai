import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ClaimCard } from "@/components/ClaimCard";
import { HallucinationAlerts } from "@/components/HallucinationAlerts";
import { ScoreCard } from "@/components/ScoreCard";
import type { VerificationReport } from "@/types";
import { cn } from "@/utils/cn";

export function ReportView({ report }: { report: VerificationReport }) {
  const [showClaims, setShowClaims] = useState(false);
  const total = report.claims.length;

  return (
    <div className="flex flex-col gap-3">
      <ScoreCard report={report} />
      <HallucinationAlerts alerts={report.alerts} />
      {total > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowClaims((value) => !value)}
            aria-expanded={showClaims}
            className="flex items-center gap-1 self-start rounded-sm text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showClaims ? "Hide" : "Show"} all {total} {total === 1 ? "claim" : "claims"}
            <ChevronDown className={cn("h-3 w-3 transition-transform", showClaims && "rotate-180")} aria-hidden="true" />
          </button>
          {showClaims && (
            <div className="flex flex-col gap-2">
              {report.claims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
