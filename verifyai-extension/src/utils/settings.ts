const SETTINGS_KEY = "verifyai_settings";

export interface Settings {
  enabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = { enabled: true };

function withDefaults(stored: Partial<Settings> | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return withDefaults(result[SETTINGS_KEY] as Partial<Settings> | undefined);
}

export async function setEnabled(enabled: boolean): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({ [SETTINGS_KEY]: { ...current, enabled } });
}

export function subscribeToSettings(listener: (settings: Settings) => void): () => void {
  const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area !== "local" || !(SETTINGS_KEY in changes)) return;
    listener(withDefaults(changes[SETTINGS_KEY].newValue as Partial<Settings> | undefined));
  };
  chrome.storage.onChanged.addListener(handleChange);
  return () => chrome.storage.onChanged.removeListener(handleChange);
}
