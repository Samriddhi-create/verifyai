import { cn } from "@/lib/cn";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import type { ClaimStatus } from "@/types";

export function StatusBreakdownBar({ counts }: { counts: Record<ClaimStatus, number> }) {
  const segments = STATUS_ORDER.filter((status) => counts[status] > 0);
  const label = STATUS_ORDER.map((status) => `${counts[status]} ${STATUS_META[status].label.toLowerCase()}`).join(", ");

  return (
    <div className="flex flex-col gap-3.5">
      <div role="img" aria-label={label} className="flex h-2.5 gap-[3px]">
        {segments.map((status, index) => (
          <span
            key={status}
            className={cn(
              STATUS_META[status].fill,
              "rounded-[2px]",
              index === 0 && "rounded-l-[5px]",
              index === segments.length - 1 && "rounded-r-[5px]"
            )}
            style={{ flex: counts[status] }}
          />
        ))}
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-x-3.5 gap-y-1.5 p-0 text-sm text-muted-foreground">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", STATUS_META[status].fill)} aria-hidden="true" />
            {STATUS_META[status].label} <b className="font-mono font-medium text-ink">{counts[status]}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
