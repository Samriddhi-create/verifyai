import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

/** The violet logo tile and wordmark. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-tile bg-violet text-violet-on shadow-glow-mark">
        <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="font-display text-xl font-bold tracking-[-0.01em] text-ink">VerifyAI</span>
    </span>
  );
}
