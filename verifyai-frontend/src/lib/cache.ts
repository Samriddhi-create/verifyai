import type { VerificationReport } from "@/types";

const CACHE_PREFIX = "verifyai_cache_";
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

interface CachedVerification {
  report: VerificationReport;
  cachedAt: number;
}

function cacheKey(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `${CACHE_PREFIX}${hash}`;
}

export function getCachedVerification(text: string): VerificationReport | null {
  try {
    const raw = localStorage.getItem(cacheKey(text));
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedVerification;
    if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(text));
      return null;
    }
    return cached.report;
  } catch {
    return null;
  }
}

export function setCachedVerification(text: string, report: VerificationReport): void {
  try {
    const entry: CachedVerification = { report, cachedAt: Date.now() };
    localStorage.setItem(cacheKey(text), JSON.stringify(entry));
  } catch {
    // localStorage can throw (quota, private mode) — caching is a best-effort optimization.
  }
}
