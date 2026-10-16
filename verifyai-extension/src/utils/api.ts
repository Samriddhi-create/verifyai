import type { ChatMessage, HistoryResponse, VerificationReport } from "@/types";
import type { BackgroundRequest, BackgroundResult } from "@/utils/messages";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function send<T>(request: BackgroundRequest): Promise<T> {
  let result: BackgroundResult<T> | undefined;
  try {
    result = (await chrome.runtime.sendMessage(request)) as BackgroundResult<T> | undefined;
  } catch {
    // Happens when the extension was reloaded while this page stayed open.
    throw new ApiError("VerifyAI was updated or restarted. Reload this page and try again.", 0);
  }

  if (!result) {
    throw new ApiError("VerifyAI's background service didn't respond. Reload the extension and try again.", 0);
  }
  if (!result.ok) {
    throw new ApiError(result.error, result.statusCode);
  }
  return result.data;
}

export function verifyText(text: string, sourceUrl?: string): Promise<VerificationReport> {
  return send<VerificationReport>({ type: "VERIFYAI_VERIFY", text, sourceUrl: sourceUrl ?? null });
}

export function getHistory(limit = 50, offset = 0): Promise<HistoryResponse> {
  return send<HistoryResponse>({ type: "VERIFYAI_HISTORY", limit, offset });
}

export function askFollowUp(
  report: VerificationReport,
  history: ChatMessage[],
  question: string
): Promise<{ answer: string }> {
  return send<{ answer: string }>({
    type: "VERIFYAI_CHAT",
    originalText: report.original_text,
    claims: report.claims,
    history,
    question,
  });
}
