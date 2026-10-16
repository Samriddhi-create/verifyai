import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

const CX = 60;
const CY = 60;
const RADIUS = 48;
const GAP = 1.6; // score points left open between zones

// Zone edges match the verdict thresholds on the backend (40 and 75).
const ZONES = [
  { from: 0, to: 40, color: "hsl(var(--contradicted))" },
  { from: 40, to: 75, color: "hsl(var(--partial))" },
  { from: 75, to: 100, color: "hsl(var(--supported))" },
] as const;

function pointAt(score: number): { x: number; y: number } {
  const angle = Math.PI * (1 - score / 100);
  return { x: CX + RADIUS * Math.cos(angle), y: CY - RADIUS * Math.sin(angle) };
}

function arcPath(from: number, to: number): string {
  const start = pointAt(from);
  const end = pointAt(to);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

interface TrustGaugeProps {
  /** 0-100, or null when there was nothing to score. */
  score: number | null;
  /** Shows a dimmed, pulsing gauge while a check is running. */
  pending?: boolean;
  className?: string;
}

export function TrustGauge({ score, pending = false, className }: TrustGaugeProps) {
  // The marker sweeps from 0 to the score once, on mount.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (score === null) return;
    const frame = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const dimmed = pending || score === null;

  return (
    <svg
      viewBox="0 0 120 70"
      className={cn("w-[132px] shrink-0", pending && "animate-pulse", className)}
      // While pending, the "Checking…" text beside the gauge is what gets announced.
      role={pending ? undefined : "img"}
      aria-hidden={pending || undefined}
      aria-label={pending ? undefined : score === null ? "Trust score unavailable" : `Trust score ${score} out of 100`}
    >
      {ZONES.map((zone) => (
        <path
          key={zone.from}
          d={arcPath(zone.from + (zone.from === 0 ? 0 : GAP), zone.to - (zone.to === 100 ? 0 : GAP))}
          fill="none"
          stroke={dimmed ? "hsl(var(--muted-foreground))" : zone.color}
          strokeOpacity={dimmed ? 0.25 : 1}
          strokeWidth={9}
        />
      ))}

      {!dimmed && (
        <g
          className="motion-reduce:!transition-none"
          style={{
            transform: `rotate(${(shown / 100) * 180}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
            transition: "transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <circle cx={CX - RADIUS} cy={CY} r={7} fill="hsl(var(--foreground))" stroke="hsl(var(--card))" strokeWidth={2.5} />
        </g>
      )}

      <text
        x={CX}
        y={CY - 2}
        textAnchor="middle"
        className={cn("fill-foreground font-semibold", score === 100 ? "text-[25px]" : "text-[30px]")}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {dimmed ? "–" : score}
      </text>
    </svg>
  );
}
