import { CircleAlert, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { title: "Extract claims", body: "Each sentence that states a fact becomes a claim." },
  { title: "Search the web", body: "Live web search gathers sources for each claim." },
  { title: "Judge the evidence", body: "Supported, partial, contradicted or unverified." },
  { title: "Retry if weak", body: "A sharper query, up to 3 attempts per claim." },
];

/** The four agent steps, as a horizontal trail from md up and a list below. */
export function AgentSteps({ steps = STEPS }: { steps?: { title: string; body: string }[] }) {
  return (
    <ol className="m-0 grid list-none grid-cols-1 gap-[18px] p-0 md:grid-cols-4">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li key={step.title} className="flex min-w-0 gap-3 md:flex-col">
            <div className="flex h-10 shrink-0 items-center md:w-full">
              <span
                aria-hidden="true"
                className={
                  last
                    ? "z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-2 border-violet bg-violet font-display text-base font-bold text-violet-on shadow-glow-node"
                    : "z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-2 border-violet bg-bg font-display text-base font-bold text-ink"
                }
              >
                {index + 1}
              </span>
              {!last && <span aria-hidden="true" className="-mr-[18px] ml-2 hidden h-[3px] flex-1 rounded-sm bg-violet shadow-glow-line md:block" />}
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 md:gap-3">
              <h3 className="text-[15px] font-semibold">{step.title}</h3>
              <p className="m-0 text-sm leading-normal text-muted-foreground">{step.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** No live per-claim progress: the API returns the whole report at once. */
export function CheckingState() {
  return (
    <section role="status" aria-live="polite" className="flex flex-wrap items-center gap-8 rounded-lg border border-line bg-surface p-6 sm:gap-12 sm:p-8">
      <div aria-hidden="true" className="relative h-[132px] w-[132px] shrink-0">
        <div className="absolute inset-[22px] rounded-full shadow-[0_0_36px_4px_var(--glow)]" />
        <svg width="132" height="132" viewBox="0 0 132 132" className="relative">
          <circle cx="66" cy="66" r="56" fill="none" stroke="var(--line)" strokeWidth="10" />
          <g className="spin-slow" style={{ transformOrigin: "66px 66px" }}>
            <circle cx="66" cy="66" r="56" fill="none" stroke="var(--violet)" strokeWidth="10" strokeLinecap="round" strokeDasharray="90 351.9" />
          </g>
        </svg>
      </div>
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2.5">
        <h2 className="font-display text-[26px] font-bold leading-tight">The agent is checking your claims</h2>
        <p className="m-0 text-base leading-relaxed text-muted-foreground">
          VerifyAI pulls out each claim and searches the live web for evidence. When a search comes back weak, it rewrites
          the query and tries again, up to 3 attempts per claim.
        </p>
        <p className="m-0 text-[15px] leading-normal text-muted-foreground">Your report appears here when every claim has been checked.</p>
      </div>
    </section>
  );
}

export function EmptyHistoryState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-line bg-surface px-6 py-16 text-center">
      <FileSearch className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-[15px] font-semibold">No checks in your history yet</p>
      <p className="max-w-[320px] text-sm text-muted-foreground">
        Checks you run here or in the extension while signed in will show up here.
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-line bg-surface px-6 py-12 text-center" role="alert">
      <CircleAlert className="h-8 w-8 text-contradicted-ink" aria-hidden="true" />
      <p className="text-[15px] font-semibold">Something went wrong</p>
      <p className="max-w-[360px] text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
