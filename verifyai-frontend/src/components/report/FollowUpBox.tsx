import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { isFlagged } from "@/lib/status";
import { useVerificationStore } from "@/store/useVerificationStore";
import type { VerificationReport } from "@/types";

const MAX_CHIP_CLAIM_LENGTH = 48;

function shorten(text: string): string {
  const trimmed = text.trim().replace(/[.!?]+$/, "");
  return trimmed.length <= MAX_CHIP_CLAIM_LENGTH ? trimmed : `${trimmed.slice(0, MAX_CHIP_CLAIM_LENGTH).trimEnd()}…`;
}

/** Suggestions built from this report, so they never mention claims it doesn't have. */
function suggestionsFor(report: VerificationReport): string[] {
  const suggestions: string[] = [];
  const flagged = report.claims.find((claim) => isFlagged(claim.status));
  if (flagged) suggestions.push(`Why was “${shorten(flagged.claim_text)}” flagged?`);
  if (report.claims.length > 0) suggestions.push("Show the strongest source for each claim");
  if (report.claims.some((claim) => claim.status === "contradicted")) {
    suggestions.push("Rewrite the text without contradicted claims");
  }
  return suggestions;
}

export function FollowUpBox({ report }: { report: VerificationReport }) {
  const { chatMessages, isChatLoading, chatError, askFollowUpQuestion } = useVerificationStore();
  const [question, setQuestion] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const suggestions = suggestionsFor(report);

  // Scroll the message list itself rather than the whole page.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [chatMessages, isChatLoading]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isChatLoading) return;
    setQuestion("");
    void askFollowUpQuestion(trimmed);
  };

  return (
    <section aria-labelledby="follow-up-heading" className="mt-3 flex flex-col gap-3 rounded-lg border border-line bg-surface px-4 py-[18px] sm:px-5">
      <h2 id="follow-up-heading" className="font-display text-lg font-bold sm:text-[19px]">
        Ask a follow-up
      </h2>

      {(chatMessages.length > 0 || isChatLoading) && (
        <div ref={listRef} className="flex max-h-96 flex-col gap-2 overflow-y-auto" aria-live="polite">
          {chatMessages.map((message, index) => (
            <p
              key={index}
              className={cn(
                "m-0 max-w-[88%] whitespace-pre-wrap rounded-lg px-3.5 py-2 text-[15px] leading-relaxed",
                message.role === "user" ? "self-end border border-line-strong bg-surface-2" : "self-start bg-surface-2"
              )}
            >
              <span className="sr-only">{message.role === "user" ? "You: " : "VerifyAI: "}</span>
              {message.content}
            </p>
          ))}
          {isChatLoading && (
            <p className="m-0 self-start rounded-lg bg-surface-2 px-3.5 py-2 text-[15px] text-muted-foreground" role="status">
              Thinking…
            </p>
          )}
        </div>
      )}

      {suggestions.length > 0 && chatMessages.length === 0 && (
        // Scrolls sideways on phones instead of wrapping.
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => ask(suggestion)}
              disabled={isChatLoading}
              className="min-h-11 shrink-0 rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-left text-sm font-medium text-muted-foreground hover:text-ink disabled:opacity-60"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {chatError && (
        <p role="alert" className="m-0 text-sm text-contradicted-ink">
          {chatError}
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
        className="m-0 flex gap-2"
      >
        <label htmlFor="follow-up-input" className="sr-only">
          Ask a follow-up question
        </label>
        <input
          id="follow-up-input"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={2000}
          placeholder="Why was this claim flagged?"
          className="h-11 min-w-0 flex-1 rounded-lg border border-line-strong bg-bg px-3.5 text-[15px] text-ink placeholder:text-muted-foreground"
        />
        <Button type="submit" size="icon" disabled={!question.trim() || isChatLoading} aria-label="Send question">
          <Send className="h-[18px] w-[18px]" aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
