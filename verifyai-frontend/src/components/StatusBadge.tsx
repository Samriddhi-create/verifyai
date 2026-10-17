import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/lib/status";
import type { ClaimStatus } from "@/types";

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const { label, icon: Icon } = STATUS_META[status];
  return (
    <Badge variant={status}>
      <Icon className="h-[15px] w-[15px]" strokeWidth={2.4} aria-hidden="true" />
      {label}
    </Badge>
  );
}
