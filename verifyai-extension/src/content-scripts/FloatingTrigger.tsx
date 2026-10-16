import { ShieldCheck } from "lucide-react";

interface FloatingTriggerProps {
  position: { top: number; left: number };
  onClick: () => void;
}

export function FloatingTrigger({ position, onClick }: FloatingTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[2147483647] flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      Check with VerifyAI
    </button>
  );
}
