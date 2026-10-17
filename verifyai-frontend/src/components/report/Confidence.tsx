import { cn } from "@/lib/cn";
import { STATUS_META, percent } from "@/lib/status";
import type { ClaimStatus } from "@/types";

/**
 * A confidence bar and percentage, or "No evidence found" for unverified
 * results: a confidence figure on an unverified result reads as contradictory.
 */
export function ConfidenceValue({
  status,
  confidence,
  barClassName = "w-[120px]",
}: {
  status: ClaimStatus;
  confidence: number;
  barClassName?: string;
}) {
  if (status === "unverified") return <span className="text-ink">No evidence found</span>;
  const value = percent(confidence);
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn("block h-1.5 overflow-hidden rounded-[3px] bg-surface-2 shadow-[inset_0_0_0_1px_var(--line)]", barClassName)}
        aria-hidden="true"
      >
        <span className={cn("block h-full rounded-[3px]", STATUS_META[status].fill)} style={{ width: `${value}%` }} />
      </span>
      <span className="font-mono text-ink">{value}%</span>
    </span>
  );
}
