import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ClaimStatus } from "@/types";

const STATUS_CONFIG: Record<ClaimStatus, { label: string; icon: typeof CheckCircle2 }> = {
  supported: { label: "Supported", icon: CheckCircle2 },
  partial: { label: "Partial", icon: AlertTriangle },
  contradicted: { label: "Contradicted", icon: XCircle },
  unverified: { label: "Unverified", icon: HelpCircle },
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const { label, icon: Icon } = STATUS_CONFIG[status];
  return (
    <Badge variant={status} aria-label={`Claim status: ${label}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}
