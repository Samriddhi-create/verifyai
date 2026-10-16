import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { HallucinationAlert } from "@/types";
import { cn } from "@/utils/cn";

const COLLAPSED_COUNT = 2;

// Flagged claims are marked like a proofreader's red pen: a rule in the margin
// and a wavy underline under the wording that failed the check.
const SEVERITY = {
  high: {
    tag: "Contradicted",
    box: "border-contradicted/40 bg-contradicted/10",
    heading: "text-red-700 dark:text-red-300",
    rule: "border-contradicted",
    underline: "decoration-contradicted",
  },
  medium: {
    tag: "Unconfirmed",
    box: "border-partial/50 bg-partial/10",
    heading: "text-amber-800 dark:text-amber-300",
    rule: "border-partial",
    underline: "decoration-partial",
  },
} as const;

export function HallucinationAlerts({ alerts }: { alerts: HallucinationAlert[] }) {
  const [expanded, setExpanded] = useState(false);
  if (alerts.length === 0) return null;

  const tone = SEVERITY[alerts.some((alert) => alert.severity === "high") ? "high" : "medium"];
  const visible = expanded ? alerts : alerts.slice(0, COLLAPSED_COUNT);
  const hidden = alerts.length - visible.length;

  return (
    <section role="alert" className={cn("rounded-md border p-2.5", tone.box)}>
      <h2 className={cn("flex items-center gap-1.5 text-xs font-semibold", tone.heading)}>
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        {alerts.length === 1 ? "Possible hallucination" : `${alerts.length} possible hallucinations`}
      </h2>
      <ul className="mt-2 flex flex-col gap-2.5">
        {visible.map((alert) => {
          const severity = SEVERITY[alert.severity];
          return (
            <li key={alert.claim_id} className={cn("border-l-2 pl-2.5", severity.rule)}>
              <p className="text-sm leading-snug">
                <span className={cn("underline decoration-wavy decoration-[1.5px] underline-offset-4", severity.underline)}>
                  {alert.claim_text}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-foreground">
                  {severity.tag}
                </span>
                {alert.message}
              </p>
            </li>
          );
        })}
      </ul>
      {(hidden > 0 || expanded) && alerts.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 rounded-sm text-xs font-medium text-foreground underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? "Show fewer" : `Show ${hidden} more`}
        </button>
      )}
    </section>
  );
}
