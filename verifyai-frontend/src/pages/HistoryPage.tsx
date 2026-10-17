import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyHistoryState, ErrorState } from "@/components/StateViews";
import { useHistory } from "@/hooks/useHistory";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import type { VerificationSummary } from "@/types";


function HistoryItem({ item }: { item: VerificationSummary }) {
  const date = new Date(item.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card>
      <CardContent className="p-5">
        <p className="line-clamp-3 text-[15px] leading-relaxed">{item.original_text}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-sm text-muted-foreground">
            {STATUS_ORDER.filter((status) => (item.summary[status] ?? 0) > 0).map((status) => (
              <span key={status} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${STATUS_META[status].fill}`} aria-hidden="true" />
                {STATUS_META[status].label} <b className="font-mono font-medium text-ink">{item.summary[status]}</b>
              </span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {item.claim_count} claim{item.claim_count === 1 ? "" : "s"} · {date}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function HistoryPage() {
  const { items, total, isLoading, error, refresh } = useHistory(true);

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 sm:pt-7">
      <header className="flex flex-col gap-2.5">
        <h1 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[40px]">History</h1>
        <p className="m-0 text-[17px] text-muted-foreground">
          {total > 0 ? `${total} check${total === 1 ? "" : "s"}` : "Your past checks"}
        </p>
      </header>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}
      {!isLoading && !error && items.length === 0 && <EmptyHistoryState />}

      {!isLoading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
