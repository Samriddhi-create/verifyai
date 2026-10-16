import { useCallback, useEffect, useState } from "react";
import { getSettings, setEnabled as persistEnabled, subscribeToSettings, type Settings } from "@/utils/settings";

interface UseSettingsResult {
  settings: Settings;
  /** False until the stored value has been read, so callers don't flash the wrong state. */
  isLoaded: boolean;
  setEnabled: (enabled: boolean) => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<Settings>({ enabled: false });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getSettings().then((stored) => {
      if (cancelled) return;
      setSettings(stored);
      setIsLoaded(true);
    });
    const unsubscribe = subscribeToSettings(setSettings);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const setEnabled = useCallback((enabled: boolean) => persistEnabled(enabled), []);

  return { settings, isLoaded, setEnabled };
}
