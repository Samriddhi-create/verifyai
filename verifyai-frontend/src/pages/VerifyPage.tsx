import { ChatPanel } from "@/components/ChatPanel";
import { EmptyState, ErrorState, LoadingReport } from "@/components/StateViews";
import { ReportView } from "@/components/ReportView";
import { TextInputPanel } from "@/components/TextInputPanel";
import { useVerificationStore } from "@/store/useVerificationStore";

export function VerifyPage() {
  const { inputText, report, isLoading, error, runVerification } = useVerificationStore();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Verify a claim</h1>
        <p className="text-sm text-muted-foreground">Paste AI-generated text below and VerifyAI will check its claims against the web.</p>
      </div>

      <TextInputPanel />

      <div>
        {isLoading && <LoadingReport />}
        {!isLoading && error && (
          <ErrorState message={error} onRetry={() => inputText.trim() && void runVerification(inputText.trim())} />
        )}
        {!isLoading && !error && report && (
          <div className="flex flex-col gap-4">
            <ReportView report={report} />
            <ChatPanel />
          </div>
        )}
        {!isLoading && !error && !report && <EmptyState />}
      </div>
    </div>
  );
}
