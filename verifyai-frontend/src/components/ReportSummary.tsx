import type { ClaimStatus, VerificationReport } from "@/types";

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

  return (
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
  );
}
