import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerificationStore } from "@/store/useVerificationStore";

const MAX_LENGTH = 50_000;

export function TextInputPanel() {
  const { inputText, setInputText, isLoading, runVerification } = useVerificationStore();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim() || isLoading) return;
    void runVerification(inputText.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="verify-input" className="sr-only">
        Text to verify
      </label>
      <textarea
        id="verify-input"
        value={inputText}
        onChange={(e) => setInputText(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="Paste AI-generated text here to check its claims…"
        rows={8}
        className="w-full resize-none rounded-md border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        maxLength={MAX_LENGTH}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {inputText.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </span>
        <Button type="submit" disabled={!inputText.trim() || isLoading} className="gap-1.5">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
          {isLoading ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </form>
  );
}
