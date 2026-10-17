import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AlertSeverity, HallucinationAlert } from "@/types";

const SEVERITY_META: Record<AlertSeverity, { label: string; className: string }> = {
  high: { label: "High", className: "bg-severity-high" },
  medium: { label: "Medium", className: "bg-severity-medium" },
};

/**
 * The backend's alerts: contradicted claims are High and unverified ones are
 * Medium. On an unreliable report the card is announced as an alert.
 */
export function HallucinationList({ alerts, urgent }: { alerts: HallucinationAlert[]; urgent: boolean }) {
  if (alerts.length === 0) return null;

  return (
    <section
      aria-labelledby="hallucinations-heading"
      role={urgent ? "alert" : undefined}
      className={cn(
        "flex min-w-0 flex-[1_1_360px] flex-col gap-3 rounded-lg border bg-surface p-[18px]",
        urgent ? "border-contradicted" : "border-line"
      )}
    >
      <div className="flex items-center gap-2.5">
        {urgent ? (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-tile bg-contradicted-soft text-contradicted-ink">
            <CircleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : (
          <CircleAlert className="h-5 w-5 shrink-0 text-contradicted-ink" aria-hidden="true" />
        )}
        <h2 id="hallucinations-heading" className="font-display text-[19px] font-bold">
          Possible hallucinations
        </h2>
        <span className="font-mono text-sm text-muted-foreground">{alerts.length}</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {alerts.map((alert) => {
          const severity = SEVERITY_META[alert.severity];
          return (
            <li key={alert.claim_id} className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <a
                  href={`#claim-${alert.claim_id}`}
                  className="text-[15px] font-semibold leading-snug text-ink no-underline hover:underline"
                >
                  {alert.claim_text}
                </a>
                <span className="text-sm leading-snug text-muted-foreground">{alert.message}</span>
              </div>
              <span
                className={cn(
                  "inline-flex h-[26px] shrink-0 items-center rounded-sm px-2.5 text-sm font-bold text-severity-on",
                  severity.className
                )}
              >
                <span className="sr-only">Severity: </span>
                {severity.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
