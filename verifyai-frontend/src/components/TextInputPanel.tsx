import { Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useVerificationStore } from "@/store/useVerificationStore";

const MAX_LENGTH = 50_000;

// Sample inputs only. Choosing one fills the text box and never starts a check.
const EXAMPLES = [
  { label: "The Eiffel Tower is in Paris.", text: "The Eiffel Tower is in Paris." },
  { label: "The Great Wall is visible from space", text: "The Great Wall of China is visible from space with the naked eye." },
  {
    label: "Mixed text (3 claims)",
    text:
      "The Eiffel Tower was completed in 1889. The Great Wall of China is visible from space with the naked eye. " +
      "The Australian Institute of Marine Science reported record-high coral cover in the northern Great Barrier Reef in 2022.",
  },
];

const canReadClipboard = typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function";

export function TextInputPanel() {
  const { inputText, setInputText, runVerification } = useVerificationStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);

  const fill = (text: string) => {
    setInputText(text.slice(0, MAX_LENGTH));
    textareaRef.current?.focus();
  };

  const paste = async () => {
    setPasteError(null);
    try {
      fill(await navigator.clipboard.readText());
    } catch {
      setPasteError("Couldn't read the clipboard. Paste into the box with Ctrl+V or ⌘V instead.");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim()) return;
    void runVerification(inputText.trim());
  };

  return (
    <div className="flex flex-col gap-7">
      <form onSubmit={handleSubmit} className="rounded-lg border border-line-strong bg-surface">
        <label htmlFor="verify-input" className="sr-only">
          Text to verify
        </label>
        <textarea
          ref={textareaRef}
          id="verify-input"
          value={inputText}
          onChange={(event) => setInputText(event.target.value.slice(0, MAX_LENGTH))}
          placeholder="Paste an answer from ChatGPT, Gemini, Claude or any other AI chatbot…"
          rows={9}
          maxLength={MAX_LENGTH}
          className="block min-h-[220px] w-full resize-y rounded-t-lg border-0 bg-transparent px-[22px] py-5 text-base leading-relaxed text-ink placeholder:text-muted-foreground"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3 pl-[22px] pr-3.5">
          <span className="font-mono text-sm text-muted-foreground">
            {inputText.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </span>
          <div className="flex gap-2">
            {canReadClipboard && (
              <Button type="button" variant="outline" onClick={() => void paste()}>
                Paste
              </Button>
            )}
            <Button type="submit" disabled={!inputText.trim()}>
              <Sparkles className="h-[17px] w-[17px]" aria-hidden="true" />
              Verify
            </Button>
          </div>
        </div>
      </form>
      {pasteError && (
        <p role="alert" className="-mt-4 text-sm text-muted-foreground">
          {pasteError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-muted-foreground">Try an example</span>
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => fill(example.text)}
            className="min-h-11 rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-left text-sm font-medium text-muted-foreground hover:text-ink"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
