import { TrustGauge } from "@/components/TrustGauge";
import type { VerificationReport } from "@/types";
import { STATUS_LABEL, STATUS_ORDER, TONE_DOT, VERDICTS, countByStatus, describeReport } from "@/utils/verdict";

export function ScoreCard({ report }: { report: VerificationReport }) {
  const verdict = VERDICTS[report.verdict];
  const counts = countByStatus(report);

  return (
    <div className="flex items-center gap-3">
      <TrustGauge score={report.trust_score} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold leading-tight">
          <span className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[verdict.tone]}`} aria-hidden="true" />
          {verdict.label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{describeReport(report)}</p>
        {report.claims.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => (
              <li key={status} className="inline-flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[status]}`} aria-hidden="true" />
                {counts[status]} {STATUS_LABEL[status].toLowerCase()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
