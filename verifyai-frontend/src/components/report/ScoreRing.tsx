const RADIUS = 92;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The trust score: always violet, whatever the verdict. 184px on phones, 210px from sm up. */
export function ScoreRing({ score }: { score: number }) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const arc = (value / 100) * CIRCUMFERENCE;

  return (
    <div role="img" aria-label={`Trust score ${value} out of 100`} className="relative h-[184px] w-[184px] shrink-0 sm:h-[210px] sm:w-[210px]">
      <div aria-hidden="true" className="absolute inset-7 rounded-full shadow-glow-ring sm:inset-8" />
      <svg viewBox="0 0 210 210" aria-hidden="true" className="relative h-full w-full -rotate-90">
        <circle cx="105" cy="105" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="14" />
        {value > 0 && (
          <circle
            cx="105"
            cy="105"
            r={RADIUS}
            fill="none"
            stroke="var(--violet)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arc} ${CIRCUMFERENCE}`}
          />
        )}
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[80px] font-bold leading-[0.85] tracking-[-0.04em] sm:text-[96px]">{value}</span>
        <span className="mt-2 font-mono text-base text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
