import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { domainOf, plural } from "@/lib/status";
import type { EvidenceSnippet } from "@/types";

const MOBILE_VISIBLE = 2;

function SourceCard({ source, className }: { source: EvidenceSnippet; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-lg border border-line bg-surface p-3.5 text-ink no-underline hover:border-line-strong",
        className
      )}
    >
      <span className="text-[15px] font-semibold leading-snug">{source.title}</span>
      <span className="clamp-2 text-sm leading-normal text-muted-foreground">{source.snippet}</span>
      <span className="font-mono text-sm text-muted-foreground">{domainOf(source.url, source.source_name)}</span>
    </a>
  );
}

/** Desktop shows every source; phones show two, then a "Show N more" button. */
export function SourceList({ sources }: { sources: EvidenceSnippet[] }) {
  const [showAll, setShowAll] = useState(false);
  const hidden = sources.length - MOBILE_VISIBLE;

  if (sources.length === 0) {
    return <p className="text-sm text-muted-foreground">No sources were found for this claim.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
        {sources.map((source, index) => (
          <SourceCard
            key={`${source.url}-${index}`}
            source={source}
            className={!showAll && index >= MOBILE_VISIBLE ? "hidden sm:flex" : undefined}
          />
        ))}
      </div>
      {!showAll && hidden > 0 && (
        <Button variant="outline" className="sm:hidden" onClick={() => setShowAll(true)}>
          Show {plural(hidden, "more source", "more sources")}
        </Button>
      )}
    </div>
  );
}
