import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { CustomerStatusBadge } from "@/components/customers/customer-status-badge";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { Recommendation } from "@/lib/recommendations/types";

export function RecommendationCustomers({ recommendation: r }: { recommendation: Recommendation }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Customers</CardTitle>
        <LinkButton href={r.exploreHref} variant="ghost" size="sm">
          Open in Customer Explorer
        </LinkButton>
      </CardHeader>
      <CardContent className="pt-0">
        {r.customers.length === 0 ? (
          <p className="text-sm text-ink-soft">No customers to show for this audience.</p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-faint border-y border-border-soft">
                    <th className="font-normal px-5 py-2">Customer</th>
                    <th className="font-normal px-5 py-2">Purchases</th>
                    <th className="font-normal px-5 py-2">Lifetime Value</th>
                    <th className="font-normal px-5 py-2">Last Purchase</th>
                    <th className="font-normal px-5 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {r.customers.map((c) => (
                    <tr key={c.customerId} className="border-b border-border-soft last:border-0">
                      <td className="px-5 py-2.5">
                        <Link
                          href={`/customers/${c.customerId}`}
                          className="text-ink hover:text-brand hover:underline underline-offset-2"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-ink">{formatNumber(c.purchaseCount)}</td>
                      <td className="px-5 py-2.5 text-ink">{formatCurrency(c.totalSpent)}</td>
                      <td className="px-5 py-2.5 text-ink-soft">
                        {c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : "—"}
                      </td>
                      <td className="px-5 py-2.5">
                        <CustomerStatusBadge status={c.lifecycleSegment} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {r.audienceSize > r.customers.length && (
              <div className="text-xs text-ink-faint mt-3 px-1">
                Showing {r.customers.length} of {formatNumber(r.audienceSize)} customers in this
                audience.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
