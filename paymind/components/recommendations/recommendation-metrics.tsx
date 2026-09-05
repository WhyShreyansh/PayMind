import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Recommendation } from "@/lib/recommendations/types";

export function RecommendationMetricsCards({ recommendation: r }: { recommendation: Recommendation }) {
  const cards = [
    { label: "Audience", value: `${formatNumber(r.audienceSize)} customers` },
    { label: "Total historical value", value: formatCurrency(r.metrics.totalValue) },
    { label: "Average spend", value: formatCurrency(r.metrics.avgSpend) },
    {
      label: "Avg. days since purchase",
      value: r.metrics.avgDaysSinceLastPurchase !== null ? `${r.metrics.avgDaysSinceLastPurchase} days` : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
