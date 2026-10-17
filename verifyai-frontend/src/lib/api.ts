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

const MOCK_DELAY_MS = 1200;

// Mock mode never touches the network or Supabase. The sample is imported
// lazily so it ships as its own chunk instead of in the main bundle.
async function mockResponse<T>(build: (mocks: typeof import("@/mocks/sampleReport")) => T): Promise<T> {
  const [mocks] = await Promise.all([
    import("@/mocks/sampleReport"),
    new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS)),
  ]);
  return build(mocks);
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
  if (env.mockApi) {
    // A fresh copy, so callers that mutate the report can't change the shared sample.
    return mockResponse(({ sampleReport }) => structuredClone(sampleReport));
  }
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
  if (env.mockApi) {
    return mockResponse(({ sampleFollowUpAnswer }) => ({ answer: sampleFollowUpAnswer }));
  }
  return request<{ answer: string }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ original_text: report.original_text, claims: report.claims, history, question }),
  });
}

export function getHistory(limit = 50, offset = 0): Promise<HistoryResponse> {
  if (env.mockApi) {
    return mockResponse(() => ({ items: [], total: 0 }));
  }
  return request<HistoryResponse>(`/api/history?limit=${limit}&offset=${offset}`);
}
