import type { ApiErrorBody, ChatMessage, HistoryResponse, VerificationReport } from "@/types";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabaseClient";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Could not reach the VerifyAI server. Check your connection.", 0);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = body.error?.message ?? message;
    } catch {
      // Response body wasn't JSON; fall back to the generic message.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export function verifyText(text: string, sourceUrl?: string): Promise<VerificationReport> {
  return request<VerificationReport>("/api/verify", {
    method: "POST",
    body: JSON.stringify({ text, source_url: sourceUrl ?? null }),
  });
}

export function askFollowUp(
  report: VerificationReport,
  history: ChatMessage[],
  question: string
): Promise<{ answer: string }> {
  return request<{ answer: string }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ original_text: report.original_text, claims: report.claims, history, question }),
  });
}

export function getHistory(limit = 50, offset = 0): Promise<HistoryResponse> {
  return request<HistoryResponse>(`/api/history?limit=${limit}&offset=${offset}`);
}
