import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** Shown only when the agent made more than one attempt. */
export function RetriedBadge({ attempts }: { attempts: number }) {
  const retries = attempts - 1;
  if (retries < 1) return null;
  return (
    <Badge variant="outline" title={`The agent searched ${attempts} times for this claim`}>
      <RefreshCw className="h-[15px] w-[15px]" strokeWidth={2.2} aria-hidden="true" />
      Retried {retries}×
    </Badge>
  );
}
