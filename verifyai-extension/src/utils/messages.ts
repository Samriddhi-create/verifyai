import type { ChatMessage, Claim, HistoryResponse, VerificationReport } from "@/types";

// Pages, the popup and the on-page widget never call the API themselves. They
// ask the background script, whose requests aren't subject to the host page's
// CORS or CSP rules.
export type BackgroundRequest =
  | { type: "VERIFYAI_VERIFY"; text: string; sourceUrl: string | null }
  | { type: "VERIFYAI_HISTORY"; limit: number; offset: number }
  | { type: "VERIFYAI_CHAT"; originalText: string; claims: Claim[]; history: ChatMessage[]; question: string };

export type BackgroundResult<T> = { ok: true; data: T } | { ok: false; error: string; statusCode: number };

export type BackgroundResponse =
  | BackgroundResult<VerificationReport>
  | BackgroundResult<HistoryResponse>
  | BackgroundResult<{ answer: string }>;

export function isBackgroundRequest(value: unknown): value is BackgroundRequest {
  if (typeof value !== "object" || value === null) return false;
  const type = (value as { type?: unknown }).type;
  return type === "VERIFYAI_VERIFY" || type === "VERIFYAI_HISTORY" || type === "VERIFYAI_CHAT";
}

// Sent by the background script to the page's content script.
export type ContentMessage =
  | { type: "VERIFYAI_OPEN_WIDGET" }
  | { type: "VERIFYAI_VERIFY_SELECTION"; text: string };

export function isContentMessage(value: unknown): value is ContentMessage {
  if (typeof value !== "object" || value === null) return false;
  const type = (value as { type?: unknown }).type;
  return type === "VERIFYAI_OPEN_WIDGET" || type === "VERIFYAI_VERIFY_SELECTION";
}
