import { ClaimCard } from "@/components/ClaimCard";
import { ReportSummary } from "@/components/ReportSummary";
import type { VerificationReport } from "@/types";

export function ReportView({ report }: { report: VerificationReport }) {
  return (
    <div className="flex flex-col gap-3">
      <ReportSummary report={report} />
      <div className="flex flex-col gap-2">
        {report.claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
}
