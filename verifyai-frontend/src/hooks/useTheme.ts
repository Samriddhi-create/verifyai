import { useCallback, useState } from "react";
import { applyTheme, readThemePreference, saveThemePreference, type ThemePreference } from "@/lib/theme";

export type { ThemePreference };

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference);

  const setTheme = useCallback((next: ThemePreference) => {
    saveThemePreference(next);
    applyTheme(next);
    setPreference(next);
  }, []);

  return { preference, setTheme };
}
