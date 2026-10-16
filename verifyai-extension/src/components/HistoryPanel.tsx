import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyHistoryState, ErrorState } from "@/components/StateViews";
import { useHistory } from "@/hooks/useHistory";
import type { VerificationSummary } from "@/types";
import { TONE_DOT, VERDICTS } from "@/utils/verdict";

function HistoryItem({ item }: { item: VerificationSummary }) {
  const date = new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const verdict = VERDICTS[item.verdict];
  return (
    <Card>
      <CardContent className="p-3">
        <p className="line-clamp-2 text-xs">{item.original_text}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
            <span className={`h-2 w-2 rounded-full ${TONE_DOT[verdict.tone]}`} aria-hidden="true" />
            {item.trust_score === null ? "No score" : `${item.trust_score}/100`}
            <span className="font-normal text-muted-foreground">{verdict.label}</span>
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {item.claim_count} claim{item.claim_count === 1 ? "" : "s"} · {date}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function HistoryPanel({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { items, isLoading, error, refresh } = useHistory(isAuthenticated);

  if (!isAuthenticated) {
    return <p className="py-10 text-center text-xs text-muted-foreground">Sign in to view your verification history.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (items.length === 0) {
    return <EmptyHistoryState />;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </div>
  );
}
