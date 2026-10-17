import { CircleCheck, CircleX, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Verdict } from "@/types";

export type RatedVerdict = Exclude<Verdict, "no_claims">;

const VERDICT_META: Record<RatedVerdict, { label: string; icon: LucideIcon; className: string }> = {
  reliable: { label: "Reliable", icon: CircleCheck, className: "bg-supported-soft text-supported-ink" },
  mixed: { label: "Mixed reliability", icon: TriangleAlert, className: "bg-partial-soft text-partial-ink" },
  unreliable: { label: "Unreliable", icon: CircleX, className: "bg-contradicted-soft text-contradicted-ink" },
};

/** Shows the verdict exactly as the backend sent it. */
export function VerdictBanner({ verdict }: { verdict: RatedVerdict }) {
  const { label, icon: Icon, className } = VERDICT_META[verdict];
  return (
    <div className={cn("flex items-center gap-2.5 rounded-md px-3 py-2.5", className)}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <strong className="font-display text-[22px] font-bold leading-tight">{label}</strong>
    </div>
  );
}
