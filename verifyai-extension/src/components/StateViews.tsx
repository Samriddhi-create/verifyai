import { AlertCircle, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyHistoryState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <FileSearch className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">No history yet</p>
      <p className="max-w-[220px] text-xs text-muted-foreground">Checks you run while signed in will show up here.</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center" role="alert">
      <AlertCircle className="h-8 w-8 text-contradicted" aria-hidden="true" />
      <p className="text-sm font-medium">Something went wrong</p>
      <p className="max-w-[220px] text-xs text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  );
}
