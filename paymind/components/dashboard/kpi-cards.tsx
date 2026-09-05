import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyCompact, formatNumber, formatPercent } from "@/lib/utils";
import type { BusinessMetrics } from "@/lib/intelligence";

export function KpiCards({ metrics }: { metrics: BusinessMetrics }) {
  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrencyCompact(metrics.totalRevenue),
      support: "From successful purchases",
    },
    {
      label: "Customers",
      value: formatNumber(metrics.totalCustomers),
      support: "Customers with purchases",
    },
    {
      label: "Returning Customers",
      value: formatNumber(metrics.returningCustomers),
      support: "Customers with 2+ purchases",
    },
    {
      label: "Repeat Purchase Rate",
      value: formatPercent(metrics.repeatPurchaseRate),
      support: "Customers who returned",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="py-4">
            <div className="text-xs text-ink-soft">{card.label}</div>
            <div className="font-serif-display text-2xl text-ink mt-1.5">
              {card.value}
            </div>
            <div className="text-xs text-ink-faint mt-1">{card.support}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
