import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { CustomerSummary } from "@/lib/intelligence";

export function CustomerKpiCards({ customer }: { customer: CustomerSummary }) {
  const cards = [
    { label: "Lifetime Value", value: formatCurrency(customer.totalSpent) },
    { label: "Purchases", value: formatNumber(customer.purchaseCount) },
    { label: "Average Order Value", value: formatCurrency(customer.avgOrderValue) },
    {
      label: "Last Purchase",
      value: customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="py-4">
            <div className="text-xs text-ink-soft">{c.label}</div>
            <div className="font-serif-display text-xl text-ink mt-1.5">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
