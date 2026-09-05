import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CustomerStatusBadge } from "./customer-status-badge";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { CustomerSummary } from "@/lib/intelligence";

export function CustomerTable({ customers }: { customers: CustomerSummary[] }) {
  if (customers.length === 0) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-sm text-ink-soft">No customers match these filters.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-ink-faint border-b border-border-soft">
              <th className="font-normal px-5 py-3">Customer</th>
              <th className="font-normal px-5 py-3">Purchases</th>
              <th className="font-normal px-5 py-3">Lifetime Value</th>
              <th className="font-normal px-5 py-3">Last Purchase</th>
              <th className="font-normal px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customerId} className="border-b border-border-soft last:border-0 hover:bg-border-soft/40">
                <td className="px-5 py-3">
                  <Link
                    href={`/customers/${c.customerId}`}
                    className="text-ink hover:text-brand hover:underline underline-offset-2"
                  >
                    {c.name}
                  </Link>
                  <div className="text-xs text-ink-faint">{c.email}</div>
                </td>
                <td className="px-5 py-3 text-ink">{formatNumber(c.purchaseCount)}</td>
                <td className="px-5 py-3 text-ink">{formatCurrency(c.totalSpent)}</td>
                <td className="px-5 py-3 text-ink-soft">
                  {c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : "—"}
                </td>
                <td className="px-5 py-3">
                  <CustomerStatusBadge status={c.lifecycleSegment} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
