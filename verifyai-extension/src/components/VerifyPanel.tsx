import { useEffect, useRef } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { ReportView } from "@/components/ReportView";
import { TrustGauge } from "@/components/TrustGauge";
import { Button } from "@/components/ui/button";
import { useVerificationStore } from "@/store/useVerificationStore";

const MAX_LENGTH = 50_000;

interface VerifyPanelProps {
  /** Focus the text box when it appears, so ⌘/Ctrl+V pastes straight in. */
  autoFocus?: boolean;
  /** Recorded with the report so history shows where the text came from. */
  sourceUrl?: string;
}

export function VerifyPanel({ autoFocus = false, sourceUrl }: VerifyPanelProps) {
  const { inputText, setInputText, report, isLoading, error, runVerification, reset } = useVerificationStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showingInput = !isLoading && !report;

  useEffect(() => {
    if (autoFocus && showingInput) textareaRef.current?.focus();
  }, [autoFocus, showingInput]);

  const submit = () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    void runVerification(text, sourceUrl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3" role="status" aria-live="polite">
        <TrustGauge score={null} pending />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Checking claims against the web…</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{inputText}</p>
        </div>
      </div>
    );
  }

  if (report) {
    return (
      <div className="flex flex-col gap-3">
        <ReportView report={report} />
        <Button variant="outline" size="sm" onClick={reset} className="self-start">
          Check another text
        </Button>
        <ChatPanel />
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-2"
    >
      {error && (
        <p
          role="alert"
          className="rounded-md border border-contradicted/40 bg-contradicted/10 p-2 text-xs text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}
      <label htmlFor="verifyai-input" className="sr-only">
        Text to check
      </label>
      <textarea
        id="verifyai-input"
        ref={textareaRef}
        value={inputText}
        onChange={(event) => setInputText(event.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder="Paste the AI-written text you want checked"
        rows={5}
        className="w-full resize-none rounded-md border border-input bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          {inputText.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </span>
        <Button type="submit" size="sm" disabled={!inputText.trim()}>
          {error ? "Try again" : "Check facts"}
        </Button>
      </div>
    </form>
  );
}
