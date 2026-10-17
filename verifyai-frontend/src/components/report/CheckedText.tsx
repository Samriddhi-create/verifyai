import { STATUS_META } from "@/lib/status";
import type { Claim, ClaimStatus } from "@/types";

interface Span {
  start: number;
  end: number;
  status: ClaimStatus;
}

/**
 * The API doesn't send where each claim sits in the text, and the backend
 * rewrites claims to stand alone, so only claims that appear word for word
 * (ignoring case) are tinted. Guessing at near matches could tint the wrong
 * sentence.
 */
function findSpans(text: string, claims: Claim[]): Span[] {
  const lower = text.toLowerCase();
  const spans: Span[] = [];
  for (const claim of claims) {
    const needle = claim.claim_text.trim().toLowerCase();
    if (!needle) continue;
    const start = lower.indexOf(needle);
    if (start === -1) continue;
    const end = start + needle.length;
    if (spans.some((span) => start < span.end && end > span.start)) continue;
    spans.push({ start, end, status: claim.status });
  }
  return spans.sort((a, b) => a.start - b.start);
}

export function CheckedText({ text, claims }: { text: string; claims: Claim[] }) {
  const spans = findSpans(text, claims);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  spans.forEach((span, index) => {
    if (span.start > cursor) parts.push(text.slice(cursor, span.start));
    parts.push(
      <mark key={index} className={`rounded px-[3px] py-0.5 text-inherit ${STATUS_META[span.status].soft}`}>
        {text.slice(span.start, span.end)}
        <span className="sr-only"> ({STATUS_META[span.status].label.toLowerCase()})</span>
      </mark>
    );
    cursor = span.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));

  return (
    <section aria-label="Checked text" className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface px-[18px] py-3.5">
      <div className="text-sm text-muted-foreground">Checked text</div>
      <p className="m-0 max-h-60 overflow-y-auto whitespace-pre-wrap text-base leading-[1.75]">{parts}</p>
    </section>
  );
}
