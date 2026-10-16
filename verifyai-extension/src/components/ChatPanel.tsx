import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useVerificationStore } from "@/store/useVerificationStore";
import { cn } from "@/utils/cn";

export function ChatPanel() {
  const { chatMessages, isChatLoading, chatError, askFollowUpQuestion } = useVerificationStore();
  const [question, setQuestion] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll the message list itself; scrollIntoView could also scroll the host page.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [chatMessages, isChatLoading]);

  const submit = () => {
    const text = question.trim();
    if (!text || isChatLoading) return;
    setQuestion("");
    void askFollowUpQuestion(text);
  };

  return (
    <section aria-label="Ask a follow-up" className="flex flex-col gap-2 border-t border-border pt-3">
      <h2 className="text-xs font-semibold text-muted-foreground">Ask a follow-up</h2>

      {(chatMessages.length > 0 || isChatLoading) && (
        <div ref={listRef} className="flex max-h-48 flex-col gap-2 overflow-y-auto" aria-live="polite">
          {chatMessages.map((message, index) => (
            <p
              key={index}
              className={cn(
                "max-w-[88%] whitespace-pre-wrap rounded-lg px-3 py-1.5 text-xs leading-relaxed",
                message.role === "user"
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-secondary text-secondary-foreground"
              )}
            >
              {message.content}
            </p>
          ))}
          {isChatLoading && (
            <p className="self-start rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground" role="status">
              Thinking…
            </p>
          )}
        </div>
      )}

      {chatError && (
        <p role="alert" className="text-xs text-red-700 dark:text-red-300">
          {chatError}
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-center gap-1.5"
      >
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={2000}
          aria-label="Your question about these results"
          placeholder="Why was this claim flagged?"
          className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!question.trim() || isChatLoading} aria-label="Send question">
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
