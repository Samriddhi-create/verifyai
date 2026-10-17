export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "verifyai-theme";
// The design is dark-first, so someone who has never chosen a theme gets dark.
const DEFAULT_PREFERENCE: ThemePreference = "dark";

const systemQuery = () => window.matchMedia("(prefers-color-scheme: light)");

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Storage can be blocked; fall back to the default.
  }
  return DEFAULT_PREFERENCE;
}

export function saveThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Best effort: the theme still applies for this visit.
  }
}

export function applyTheme(preference: ThemePreference): void {
  const isLight = preference === "light" || (preference === "system" && systemQuery().matches);
  document.documentElement.classList.toggle("light", isLight);
}

/** Applies the saved theme before the first render and follows the OS while on "system". */
export function initTheme(): void {
  applyTheme(readThemePreference());
  systemQuery().addEventListener("change", () => {
    if (readThemePreference() === "system") applyTheme("system");
  });
}
