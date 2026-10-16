import type { ApiErrorBody, ChatMessage, Claim, HistoryResponse, VerificationReport } from "@/types";
import type { BackgroundResult } from "@/utils/messages";
import { env } from "@/utils/env";
import { getStoredSession } from "@/utils/storage";

const REQUEST_TIMEOUT_MS = 120_000;
// Browsers stop an idle background script after ~30s, and a long text can take
// longer than that to check. Any extension API call resets that idle timer.
const KEEP_ALIVE_INTERVAL_MS = 20_000;

function failure(error: string, statusCode: number): BackgroundResult<never> {
  return { ok: false, error, statusCode };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<BackgroundResult<T>> {
  const session = await getStoredSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const keepAlive = setInterval(() => {
    void chrome.runtime.getPlatformInfo();
  }, KEEP_ALIVE_INTERVAL_MS);

  try {
    let response: Response;
    try {
      response = await fetch(`${env.apiBaseUrl}${path}`, { ...init, headers, signal: controller.signal });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return failure("The check took too long. Try again with a shorter text.", 0);
      }
      return failure("Could not reach the VerifyAI server. Check your connection.", 0);
    }

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const body = (await response.json()) as ApiErrorBody;
        message = body.error?.message ?? message;
      } catch {
        // Response body wasn't JSON; keep the generic message.
      }
      return failure(message, response.status);
    }

    return { ok: true, data: (await response.json()) as T };
  } finally {
    clearTimeout(timeout);
    clearInterval(keepAlive);
  }
}

export function fetchVerification(text: string, sourceUrl: string | null): Promise<BackgroundResult<VerificationReport>> {
  return request<VerificationReport>("/api/verify", {
    method: "POST",
    body: JSON.stringify({ text, source_url: sourceUrl }),
  });
}

export function fetchHistory(limit: number, offset: number): Promise<BackgroundResult<HistoryResponse>> {
  return request<HistoryResponse>(`/api/history?limit=${limit}&offset=${offset}`);
}

export function fetchChat(
  originalText: string,
  claims: Claim[],
  history: ChatMessage[],
  question: string
): Promise<BackgroundResult<{ answer: string }>> {
  return request<{ answer: string }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ original_text: originalText, claims, history, question }),
  });
}
