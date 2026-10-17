import { Flag } from "lucide-react";
import { ConfidenceValue } from "@/components/report/Confidence";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/cn";
import type { AgentAttempt } from "@/types";

function Node({ attempt, kept }: { attempt: number; kept: boolean }) {
  return (
    <span
      className={cn(
        "z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-2 border-violet font-display text-base font-bold",
        kept ? "bg-violet text-violet-on shadow-glow-node" : "bg-bg text-ink"
      )}
      aria-hidden="true"
    >
      {attempt}
    </span>
  );
}

function EndNode() {
  return (
    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-tile border-2 border-violet text-violet" aria-hidden="true">
      <Flag className="h-4 w-4" strokeWidth={2.4} />
    </span>
  );
}

/** Facts only: number, query, sources found, status, confidence and the kept marker. */
function AttemptCard({ attempt, kept }: { attempt: AgentAttempt; kept: boolean }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-lg bg-surface px-4 py-3.5",
        kept ? "border-[1.5px] border-violet" : "border border-line"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-base">Attempt {attempt.attempt}</strong>
        {kept && <span className="rounded-sm border border-violet bg-violet-soft px-2 py-0.5 text-sm font-semibold text-ink">Kept result</span>}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Search query</span>
        <div className="rounded-sm border border-line bg-surface-2 px-2.5 py-2 font-mono text-sm leading-normal [overflow-wrap:anywhere]">
          “{attempt.query}”
        </div>
      </div>
      <dl className="m-0 grid grid-cols-[auto_1fr] items-center gap-x-3.5 gap-y-2 text-sm">
        <dt className="whitespace-nowrap text-muted-foreground">Sources found</dt>
        <dd className="m-0 font-mono">{attempt.sources_found}</dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd className="m-0">
          <StatusBadge status={attempt.status} />
        </dd>
        <dt className="text-muted-foreground">Confidence</dt>
        <dd className="m-0">
          <ConfidenceValue status={attempt.status} confidence={attempt.confidence_score} barClassName="w-[90px]" />
        </dd>
      </dl>
    </div>
  );
}

function VerdictText({ line }: { line: string }) {
  return (
    <div className="flex flex-col gap-2 pt-0.5">
      <strong className="text-base">Verdict</strong>
      <span className="text-[15px] leading-relaxed text-muted-foreground">{line}</span>
    </div>
  );
}

/**
 * The agent's search attempts: horizontal with a node row on wide screens,
 * vertical with a rail on the left below lg.
 */
export function SearchTrail({
  trace,
  keptAttempt,
  verdict,
}: {
  trace: AgentAttempt[];
  keptAttempt: number | null;
  verdict: string;
}) {
  return (
    <>
      {/* Horizontal */}
      <ol
        className="m-0 hidden list-none gap-5 p-0 lg:grid"
        // The verdict column needs less room than an attempt card.
        style={{ gridTemplateColumns: `repeat(${trace.length}, minmax(0, 1fr)) minmax(0, 0.7fr)` }}
      >
        {trace.map((attempt) => (
          <li key={attempt.attempt} className="flex min-w-0 flex-col gap-4">
            <div className="flex h-11 items-center">
              <Node attempt={attempt.attempt} kept={attempt.attempt === keptAttempt} />
              {/* Runs into the next column's node, never behind text. */}
              <span className="-mr-[18px] ml-2 h-[3px] flex-1 rounded-sm bg-violet shadow-glow-line" aria-hidden="true" />
            </div>
            <AttemptCard attempt={attempt} kept={attempt.attempt === keptAttempt} />
          </li>
        ))}
        <li className="flex min-w-0 flex-col gap-4">
          <div className="flex h-11 items-center">
            <EndNode />
          </div>
          <VerdictText line={verdict} />
        </li>
      </ol>

      {/* Vertical */}
      <ol className="m-0 flex list-none flex-col p-0 lg:hidden">
        {trace.map((attempt) => (
          <li key={attempt.attempt} className="flex gap-3">
            <div className="flex w-[34px] shrink-0 flex-col items-center">
              <Node attempt={attempt.attempt} kept={attempt.attempt === keptAttempt} />
              <span className="w-[3px] flex-1 rounded-sm bg-violet shadow-glow-line" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 pb-4">
              <AttemptCard attempt={attempt} kept={attempt.attempt === keptAttempt} />
            </div>
          </li>
        ))}
        <li className="flex gap-3">
          <div className="flex w-[34px] shrink-0 justify-center">
            <EndNode />
          </div>
          <div className="min-w-0 flex-1">
            <VerdictText line={verdict} />
          </div>
        </li>
      </ol>
    </>
  );
}
