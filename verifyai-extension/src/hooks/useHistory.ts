import { useCallback, useEffect, useState } from "react";
import type { VerificationSummary } from "@/types";
import { ApiError, getHistory } from "@/utils/api";

interface UseHistoryResult {
  items: VerificationSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHistory(enabled: boolean): UseHistoryResult {
  const [items, setItems] = useState<VerificationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getHistory()
      .then((response) => {
        if (!cancelled) setItems(response.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load history.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, refreshToken]);

  return { items, isLoading, error, refresh };
}
