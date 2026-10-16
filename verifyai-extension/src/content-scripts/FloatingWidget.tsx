import { ChevronDown, ChevronUp, ShieldCheck, X } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { VerifyPanel } from "@/components/VerifyPanel";
import { Button } from "@/components/ui/button";
import { useVerificationStore } from "@/store/useVerificationStore";
import { cn } from "@/utils/cn";
import { TONE_DOT, VERDICTS } from "@/utils/verdict";

const MARGIN = 16;
const HEADER_VISIBLE_PX = 44;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function FloatingWidget({ onClose }: { onClose: () => void }) {
  const { report, isLoading } = useVerificationStore();
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const grabOffset = useRef<{ x: number; y: number } | null>(null);

  const verdict = report ? VERDICTS[report.verdict] : null;

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button") || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    grabOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!grabOffset.current || !rootRef.current) return;
    const { width } = rootRef.current.getBoundingClientRect();
    setPosition({
      left: clamp(event.clientX - grabOffset.current.x, 0, window.innerWidth - width),
      top: clamp(event.clientY - grabOffset.current.y, 0, window.innerHeight - HEADER_VISIBLE_PX),
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Keep typing here from triggering the host page's own keyboard shortcuts.
    event.stopPropagation();
    if (event.key === "Escape") onClose();
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="VerifyAI fact check"
      onKeyDown={handleKeyDown}
      onKeyUp={(event) => event.stopPropagation()}
      style={position ? { left: position.left, top: position.top } : { right: MARGIN, bottom: MARGIN }}
      className="fixed z-[2147483647] w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border border-border bg-card font-sans text-sm leading-normal text-card-foreground shadow-2xl"
    >
      {/* The top edge carries the verdict colour, so a collapsed widget still reads at a glance. */}
      <div className={cn("h-1 w-full", verdict ? TONE_DOT[verdict.tone] : "bg-border")} aria-hidden="true" />

      <div
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={() => (grabOffset.current = null)}
        className="flex cursor-grab touch-none select-none items-center gap-2 px-3 py-2 active:cursor-grabbing"
      >
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold">VerifyAI</span>
        {collapsed && (
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" aria-live="polite">
            {isLoading ? "Checking…" : report && verdict ? `${report.trust_score ?? "–"} · ${verdict.label}` : ""}
          </span>
        )}
        <div className="ml-auto flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand" : "Minimize"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="max-h-[70vh] overflow-y-auto px-3 pb-3">
          <VerifyPanel autoFocus sourceUrl={window.location.href} />
        </div>
      )}
    </div>
  );
}
