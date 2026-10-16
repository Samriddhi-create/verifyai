import { ExternalLink } from "lucide-react";
import type { EvidenceSnippet } from "@/types";

export function EvidenceList({ evidence }: { evidence: EvidenceSnippet[] }) {
  if (evidence.length === 0) {
    return <p className="text-xs text-muted-foreground">No evidence sources were found for this claim.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {evidence.map((item) => (
        <li key={item.url} className="rounded-md border border-border bg-background p-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between gap-2 text-xs font-medium text-foreground hover:text-primary"
          >
            <span className="line-clamp-1">{item.title}</span>
            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
          </a>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.snippet}</p>
          {item.source_name && <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">{item.source_name}</p>}
        </li>
      ))}
    </ul>
  );
}
