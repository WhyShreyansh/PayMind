import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { CustomerListSummary } from "@/lib/customers";

export function CustomerSummaryCards({ summary }: { summary: CustomerListSummary }) {
  const cards = [
    { label: "Total Customers", value: summary.totalCustomers },
    { label: "Returning Customers", value: summary.returningCustomers },
    { label: "At Risk", value: summary.atRiskCustomers },
    { label: "Loyal Customers", value: summary.loyalCustomers },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="py-4">
            <div className="text-xs text-ink-soft">{c.label}</div>
            <div className="font-serif-display text-2xl text-ink mt-1.5">
              {formatNumber(c.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
