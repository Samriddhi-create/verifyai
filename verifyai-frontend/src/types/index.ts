export type ClaimStatus = "supported" | "partial" | "contradicted" | "unverified";

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

export interface VerificationReport {
  id: string;
  user_id: string | null;
  original_text: string;
  source_url: string | null;
  claims: Claim[];
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
