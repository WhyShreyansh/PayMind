import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { AtRiskCustomer } from "@/lib/intelligence";

export function AtRiskCustomers({
  customers,
  totalAtRisk,
}: {
  customers: AtRiskCustomer[];
  totalAtRisk: number;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center gap-2 text-ink">
          <AlertTriangle className="h-4 w-4 text-amber" strokeWidth={1.75} />
          <span className="text-[15px] font-medium">Customers At Risk</span>
        </div>

        {totalAtRisk === 0 ? (
          <p className="text-sm text-ink-soft mt-3">
            No customers are currently overdue for a repurchase. Nice.
          </p>
        ) : (
          <>
            <div className="font-serif-display text-3xl text-ink mt-3">
              {formatNumber(totalAtRisk)} customers
            </div>
            <p className="text-sm text-ink-soft mt-1">
              Inactivity significantly beyond their typical purchase cycle.
            </p>

            <ul className="mt-4 divide-y divide-border-soft">
              {customers.map((c) => (
                <li key={c.customerId} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="text-ink">{c.name}</div>
                    <div className="text-xs text-ink-faint">
                      Last purchase {c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber text-xs font-medium">
                      {c.daysOverdue}d overdue
                    </div>
                    <div className="text-xs text-ink-faint">{formatCurrency(c.totalSpent)}</div>
                  </div>
                </li>
              ))}
            </ul>

            <LinkButton href="/customers?status=AT_RISK" variant="secondary" size="sm" className="mt-4">
              View At-Risk Customers
            </LinkButton>
          </>
        )}
      </CardContent>
    </Card>
  );
}
