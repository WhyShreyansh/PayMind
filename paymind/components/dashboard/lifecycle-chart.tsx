import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { LifecycleDistribution } from "@/lib/intelligence";

const SEGMENT_LABELS: Record<string, string> = {
  NEW: "New",
  SECOND_PURCHASE: "Second Purchase",
  REPEAT: "Repeat",
  LOYAL: "Loyal",
  AT_RISK: "At Risk",
  CHURNED: "Churned",
};

const SEGMENT_TONE: Record<string, string> = {
  NEW: "bg-brand",
  SECOND_PURCHASE: "bg-brand",
  REPEAT: "bg-brand",
  LOYAL: "bg-brand",
  AT_RISK: "bg-amber",
  CHURNED: "bg-ink-faint",
};

export function LifecycleChart({ lifecycle }: { lifecycle: LifecycleDistribution[] }) {
  const total = lifecycle.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Lifecycle</CardTitle>
        <CardDescription>Where every purchasing customer currently sits</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-ink-soft">No customers with purchases yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {lifecycle.map((s) => {
              const isAtRisk = s.segment === "AT_RISK";
              return (
                <Link
                  key={s.segment}
                  href={`/customers?status=${s.segment}`}
                  className={
                    "rounded-md border p-3 transition-colors hover:border-ink-faint " +
                    (isAtRisk
                      ? "border-amber/40 bg-amber-soft/60"
                      : "border-border bg-surface")
                  }
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${SEGMENT_TONE[s.segment]}`} />
                    <span className="text-xs text-ink-soft">
                      {SEGMENT_LABELS[s.segment] ?? s.segment}
                    </span>
                  </div>
                  <div className="font-serif-display text-xl text-ink mt-1">
                    {formatNumber(s.count)}
                  </div>
                  <div className="text-xs text-ink-faint">{formatPercent(s.percentage)}</div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
