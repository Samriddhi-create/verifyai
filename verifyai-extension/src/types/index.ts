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

export interface Claim {
  id: string;
  claim_text: string;
  status: ClaimStatus;
  evidence: EvidenceSnippet[];
  confidence_score: number;
  reasoning: string | null;
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
  trust_score: number | null;
  verdict: Verdict;
  alerts: HallucinationAlert[];
  created_at: string;
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
  trust_score: number | null;
  verdict: Verdict;
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

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
  expiresAt: number;
}
