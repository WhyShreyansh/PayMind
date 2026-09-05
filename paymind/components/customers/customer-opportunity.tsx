import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CustomerOpportunity as CustomerOpportunityType } from "@/lib/customers";

export function CustomerOpportunity({ opportunity }: { opportunity: CustomerOpportunityType }) {
  if (opportunity.kind === "NONE" && !opportunity.description) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Next Best Opportunity</CardTitle>
        <Badge tone="neutral">Behavior-based opportunity</Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-ink">
          <Zap className="h-4 w-4 text-brand" strokeWidth={1.75} />
          <span className="font-medium">{opportunity.label}</span>
        </div>
        <p className="text-sm text-ink-soft mt-2">{opportunity.description}</p>
        {opportunity.recommendedProduct && (
          <p className="text-xs text-ink-faint mt-2">
            Recommended product: {opportunity.recommendedProduct}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
