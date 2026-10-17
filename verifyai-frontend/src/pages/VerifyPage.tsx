import { Loader2 } from "lucide-react";
import { ReportView } from "@/components/ReportView";
import { FollowUpBox } from "@/components/report/FollowUpBox";
import { AgentSteps, CheckingState, ErrorState } from "@/components/StateViews";
import { TextInputPanel } from "@/components/TextInputPanel";
import { Button } from "@/components/ui/button";
import { useVerificationStore } from "@/store/useVerificationStore";

function PageIntro() {
  return (
    <header className="flex flex-col gap-2.5">
      <h1 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">Verify a claim</h1>
      <p className="m-0 max-w-[640px] text-[17px] leading-normal text-muted-foreground">
        Paste AI-generated text. VerifyAI splits it into claims and checks each one against live web evidence.
      </p>
    </header>
  );
}

export function VerifyPage() {
  const { inputText, report, isLoading, error, runVerification, cancelVerification, reset } = useVerificationStore();

  const startNewCheck = () => {
    reset();
    window.scrollTo({ top: 0 });
  };

  if (report && !isLoading) {
    return (
      <div className="mx-auto flex max-w-[1040px] flex-col gap-4">
        <ReportView report={report} onNewCheck={startNewCheck} />
        <FollowUpBox report={report} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-[860px] flex-col gap-6 sm:pt-7">
        <h1 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">Verify a claim</h1>
        <div className="rounded-lg border border-line bg-surface">
          <p className="m-0 max-h-60 overflow-y-auto whitespace-pre-wrap px-[22px] py-[18px] text-base leading-relaxed text-muted-foreground">
            {inputText}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3 pl-[22px] pr-3.5">
            <span className="font-mono text-sm text-muted-foreground">{inputText.length.toLocaleString()} / 50,000</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelVerification}>
                Cancel
              </Button>
              <Button disabled className="disabled:opacity-75">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Checking
              </Button>
            </div>
          </div>
        </div>
        <CheckingState />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-7 sm:pt-7">
      <PageIntro />
      {error && <ErrorState message={error} onRetry={() => inputText.trim() && void runVerification(inputText.trim())} />}
      <TextInputPanel />
      <section aria-labelledby="how-heading" className="flex flex-col gap-[18px] border-t border-line pt-[26px]">
        <h2 id="how-heading" className="font-display text-xl font-bold">
          How the agent checks your text
        </h2>
        <AgentSteps />
      </section>
    </div>
  );
}
