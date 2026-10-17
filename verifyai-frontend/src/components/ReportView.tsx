import { ClaimCard } from "@/components/ClaimCard";
import { HallucinationAlerts } from "@/components/HallucinationAlerts";
import { ReportSummary } from "@/components/ReportSummary";
import type { VerificationReport } from "@/types";

export function ReportView({ report }: { report: VerificationReport }) {
  return (
    <div className="flex flex-col gap-3">
      <ReportSummary report={report} />
      {/* Older cached reports predate alerts. */}
      <HallucinationAlerts alerts={report.alerts ?? []} />
      <div className="flex flex-col gap-2">
        {report.claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
}
