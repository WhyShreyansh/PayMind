"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { BusinessMetrics } from "@/lib/intelligence";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export function PurchaseJourney({ metrics }: { metrics: BusinessMetrics }) {
  const total = metrics.totalCustomers;
  const data = [
    { label: "1 purchase", count: metrics.oneTimeBuyers },
    { label: "2 purchases", count: metrics.secondTimeBuyers },
    { label: "3 purchases", count: metrics.thirdTimeBuyers },
    { label: "4+ purchases", count: metrics.fourPlusBuyers },
  ];

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Purchase Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-soft">
            No purchases yet — this chart will populate once orders come in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Purchase Journey</CardTitle>
        <CardDescription>How many times each customer has purchased</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border-soft)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "var(--ink-soft)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--ink-soft)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--border-soft)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const count = payload[0].value as number;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div className="bg-ink text-white text-xs rounded-md px-3 py-2 shadow-lg">
                      <div className="font-medium">{formatNumber(count)} customers</div>
                      <div className="text-white/70">{pct}% of total</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
                {data.map((_, i) => (
                  <Cell key={i} fill="var(--brand)" fillOpacity={1 - i * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
