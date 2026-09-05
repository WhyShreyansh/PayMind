"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrencyCompact, formatPercent } from "@/lib/utils";
import type { BusinessMetrics } from "@/lib/intelligence";

export function RevenueBreakdown({ metrics }: { metrics: BusinessMetrics }) {
  const total = metrics.totalRevenue;
  const returningPct = total > 0 ? metrics.returningCustomerRevenue / total : 0;
  const newPct = total > 0 ? metrics.newCustomerRevenue / total : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue from Returning Customers</CardTitle>
        <CardDescription>New vs. returning customer revenue, all time</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-ink-soft">No revenue recorded yet.</p>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="font-serif-display text-2xl text-ink">
                  {formatCurrencyCompact(metrics.returningCustomerRevenue)}
                </div>
                <div className="text-xs text-ink-soft mt-0.5">
                  Returning customer revenue · {formatPercent(returningPct)} of total
                </div>
              </div>
            </div>

            <div className="h-2.5 w-full rounded-full bg-border-soft overflow-hidden flex">
              <div
                className="h-full bg-brand"
                style={{ width: `${returningPct * 100}%` }}
                title={`Returning: ${formatPercent(returningPct)}`}
              />
              <div
                className="h-full bg-amber"
                style={{ width: `${newPct * 100}%` }}
                title={`New: ${formatPercent(newPct)}`}
              />
            </div>

            <div className="flex items-center justify-between mt-3 text-xs">
              <div className="flex items-center gap-1.5 text-ink-soft">
                <span className="h-2 w-2 rounded-full bg-brand" />
                Returning · {formatCurrencyCompact(metrics.returningCustomerRevenue)}
              </div>
              <div className="flex items-center gap-1.5 text-ink-soft">
                <span className="h-2 w-2 rounded-full bg-amber" />
                New · {formatCurrencyCompact(metrics.newCustomerRevenue)}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
