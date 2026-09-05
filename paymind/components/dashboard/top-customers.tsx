import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { CustomerSummary } from "@/lib/intelligence";

export function TopCustomers({ customers }: { customers: CustomerSummary[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Top Customers</CardTitle>
        <LinkButton href="/customers" variant="ghost" size="sm">
          View All Customers
        </LinkButton>
      </CardHeader>
      <CardContent className="pt-0">
        {customers.length === 0 ? (
          <p className="text-sm text-ink-soft">No customers with purchases yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-faint border-y border-border-soft">
                  <th className="font-normal px-5 py-2">Customer</th>
                  <th className="font-normal px-5 py-2">Purchases</th>
                  <th className="font-normal px-5 py-2">Lifetime Value</th>
                  <th className="font-normal px-5 py-2">Last Purchase</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.customerId} className="border-b border-border-soft last:border-0">
                    <td className="px-5 py-2.5">
                      <div className="text-ink">{c.name}</div>
                      <div className="text-xs text-ink-faint">{c.email}</div>
                    </td>
                    <td className="px-5 py-2.5">
                      <Badge tone={c.lifecycleSegment === "LOYAL" ? "brand" : "neutral"}>
                        {formatNumber(c.purchaseCount)}
                      </Badge>
                    </td>
                    <td className="px-5 py-2.5 text-ink">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-5 py-2.5 text-ink-soft">
                      {c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
