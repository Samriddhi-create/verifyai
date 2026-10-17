export type ClaimStatus = "supported" | "partial" | "contradicted" | "unverified";

export type Verdict = "reliable" | "mixed" | "unreliable" | "no_claims";

export type AlertSeverity = "high" | "medium";

export interface EvidenceSnippet {
  url: string;
  title: string;
  snippet: string;
  source_name: string | null;
  published_date: string | null;
}

/** One search-and-judge round the backend agent performed for a claim. */
export interface AgentAttempt {
  attempt: number;
  query: string;
  sources_found: number;
  status: ClaimStatus;
  confidence_score: number;
}

export interface Claim {
  id: string;
  claim_text: string;
  status: ClaimStatus;
  evidence: EvidenceSnippet[];
  confidence_score: number;
  reasoning: string | null;
  trace: AgentAttempt[];
}

export interface HallucinationAlert {
  claim_id: string;
  claim_text: string;
  severity: AlertSeverity;
  message: string;
}

export interface VerificationReport {
  id: string;
  user_id: string | null;
  original_text: string;
  source_url: string | null;
  claims: Claim[];
  created_at: string;
  trust_score: number | null;
  verdict: Verdict;
  alerts: HallucinationAlert[];
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface VerificationSummary {
  id: string;
  original_text: string;
  claim_count: number;
  summary: Record<ClaimStatus, number>;
  created_at: string;
}

export interface HistoryResponse {
  items: VerificationSummary[];
  total: number;
}

export interface ApiErrorBody {
  error: {
    message: string;
    status_code: number;
  };
}
