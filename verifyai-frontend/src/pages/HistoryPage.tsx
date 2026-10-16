import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyHistoryState, ErrorState } from "@/components/StateViews";
import { useHistory } from "@/hooks/useHistory";
import type { ClaimStatus, VerificationSummary } from "@/types";

const STATUS_COLOR: Record<ClaimStatus, string> = {
  supported: "bg-supported",
  partial: "bg-partial",
  contradicted: "bg-contradicted",
  unverified: "bg-unverified",
};
const STATUS_LABEL: Record<ClaimStatus, string> = {
  supported: "Supported",
  partial: "Partial",
  contradicted: "Contradicted",
  unverified: "Unverified",
};

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
      <CardContent className="p-4">
        <p className="line-clamp-3 text-sm">{item.original_text}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {(Object.keys(item.summary) as ClaimStatus[])
              .filter((status) => item.summary[status] > 0)
              .map((status) => (
                <span key={status} className="inline-flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLOR[status]}`} />
                  {STATUS_LABEL[status]} ({item.summary[status]})
                </span>
              ))}
          </div>
          <span className="text-xs text-muted-foreground">
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
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `${total} verification${total === 1 ? "" : "s"}` : "Your past verifications"}
        </p>
      </div>

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
