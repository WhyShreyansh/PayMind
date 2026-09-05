import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { CustomerSummary } from "@/lib/intelligence";

const NOT_ENOUGH = "Not enough purchase history";

export function CustomerBehavior({ customer }: { customer: CustomerSummary }) {
  const rows = [
    {
      label: "Average purchase interval",
      value:
        customer.avgPurchaseIntervalDays !== null
          ? `${Math.round(customer.avgPurchaseIntervalDays)} days`
          : NOT_ENOUGH,
    },
    {
      label: "Days since last purchase",
      value: customer.daysSinceLastPurchase !== null ? `${customer.daysSinceLastPurchase} days` : NOT_ENOUGH,
    },
    { label: "Most purchased product", value: customer.favoriteProduct ?? NOT_ENOUGH },
    { label: "Most purchased category", value: customer.favoriteCategory ?? NOT_ENOUGH },
    {
      label: "First purchase date",
      value: customer.firstPurchaseDate ? formatDate(customer.firstPurchaseDate) : NOT_ENOUGH,
    },
    {
      label: "Last purchase date",
      value: customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : NOT_ENOUGH,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Behavior</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm border-b border-border-soft pb-2">
              <dt className="text-ink-soft">{r.label}</dt>
              <dd className={r.value === NOT_ENOUGH ? "text-ink-faint italic" : "text-ink"}>
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
