import { AlertCircle, FileSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingReport() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Verifying text">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="mb-1 h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <ShieldCheck className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">Nothing verified yet</p>
      <p className="max-w-[280px] text-xs text-muted-foreground">Paste AI-generated text below to check its claims.</p>
    </div>
  );
}

export function EmptyHistoryState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <FileSearch className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">No verification history yet</p>
      <p className="max-w-[280px] text-xs text-muted-foreground">
        Reports you run from the dashboard or the extension while signed in will show up here.
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center" role="alert">
      <AlertCircle className="h-8 w-8 text-contradicted" aria-hidden="true" />
      <p className="text-sm font-medium">Something went wrong</p>
      <p className="max-w-[280px] text-xs text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  );
}
