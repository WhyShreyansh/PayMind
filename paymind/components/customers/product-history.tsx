import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { ProductHistoryEntry } from "@/lib/customers";

export function ProductHistory({ products }: { products: ProductHistoryEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products Purchased</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-ink-soft">No product history available for this customer.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-faint border-y border-border-soft">
                  <th className="font-normal px-5 py-2">Product</th>
                  <th className="font-normal px-5 py-2">Purchases</th>
                  <th className="font-normal px-5 py-2">Total Qty</th>
                  <th className="font-normal px-5 py-2">Last Purchased</th>
                  <th className="font-normal px-5 py-2">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productId} className="border-b border-border-soft last:border-0">
                    <td className="px-5 py-2.5">
                      <div className="text-ink">{p.productName}</div>
                      <div className="text-xs text-ink-faint">{p.category}</div>
                    </td>
                    <td className="px-5 py-2.5 text-ink">{formatNumber(p.orderCount)}</td>
                    <td className="px-5 py-2.5 text-ink">{formatNumber(p.totalQuantity)}</td>
                    <td className="px-5 py-2.5 text-ink-soft">{formatDate(p.lastPurchasedAt)}</td>
                    <td className="px-5 py-2.5 text-ink">{formatCurrency(p.totalSpent)}</td>
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
