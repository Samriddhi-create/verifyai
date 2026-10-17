import { AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlertSeverity, HallucinationAlert } from "@/types";

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; variant: "contradicted" | "partial" }> = {
  high: { label: "High", variant: "contradicted" },
  medium: { label: "Medium", variant: "partial" },
};

export function HallucinationAlerts({ alerts }: { alerts: HallucinationAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5">
          <AlertOctagon className="h-4 w-4 text-contradicted" aria-hidden="true" />
          Possible hallucinations
          <span className="font-normal text-muted-foreground">({alerts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => {
            const severity = SEVERITY_CONFIG[alert.severity];
            return (
              <li key={alert.claim_id} className="flex flex-col gap-1 rounded-md border border-border bg-background p-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium leading-snug">{alert.claim_text}</p>
                  <Badge variant={severity.variant} className="shrink-0" aria-label={`Severity: ${severity.label}`}>
                    {severity.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
