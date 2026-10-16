import type { Session, VerificationReport } from "@/types";

const SESSION_KEY = "verifyai_session";
const PENDING_TEXT_KEY = "verifyai_pending_text";
// Bump the version when the report shape changes so stale cached reports
// (e.g. ones saved before trust scores existed) are never shown.
const CACHE_KEY_PREFIX = "verifyai_cache_v2_";
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export async function getStoredSession(): Promise<Session | null> {
  const result = await chrome.storage.local.get(SESSION_KEY);
  const session = result[SESSION_KEY] as Session | undefined;
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    await clearStoredSession();
    return null;
  }
  return session;
}

export async function setStoredSession(session: Session): Promise<void> {
  await chrome.storage.local.set({ [SESSION_KEY]: session });
}

export async function clearStoredSession(): Promise<void> {
  await chrome.storage.local.remove(SESSION_KEY);
}

function cacheKey(text: string): string {
  // A cheap, deterministic hash avoids storing raw text as a key.
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `${CACHE_KEY_PREFIX}${hash}`;
}

interface CachedVerification {
  report: VerificationReport;
  cachedAt: number;
}

export async function getCachedVerification(text: string): Promise<VerificationReport | null> {
  const key = cacheKey(text);
  const result = await chrome.storage.local.get(key);
  const cached = result[key] as CachedVerification | undefined;
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
    await chrome.storage.local.remove(key);
    return null;
  }
  return cached.report;
}

export async function setCachedVerification(text: string, report: VerificationReport): Promise<void> {
  const key = cacheKey(text);
  const entry: CachedVerification = { report, cachedAt: Date.now() };
  await chrome.storage.local.set({ [key]: entry });
}

// Hands selected text to the toolbar popup when the page can't host the
// on-page widget (browser pages, tabs opened before install).
export async function setPendingText(text: string): Promise<void> {
  await chrome.storage.local.set({ [PENDING_TEXT_KEY]: text });
}

export async function takePendingText(): Promise<string | null> {
  const result = await chrome.storage.local.get(PENDING_TEXT_KEY);
  const text = result[PENDING_TEXT_KEY] as string | undefined;
  if (text === undefined) return null;
  await chrome.storage.local.remove(PENDING_TEXT_KEY);
  return text;
}
