import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PriorityBadge } from "@/components/recommendations/priority-badge";
import { formatNumber } from "@/lib/utils";
import type { Recommendation } from "@/lib/recommendations";

export function RecommendedActions({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-brand" strokeWidth={1.75} />
          Recommended actions
        </CardTitle>
        <LinkButton href="/recommendations" variant="ghost" size="sm">
          View all recommendations
        </LinkButton>
      </CardHeader>
      <CardContent className="pt-0">
        {recommendations.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No strong opportunities right now — check back as more transactions come in.
          </p>
        ) : (
          <ul className="divide-y divide-border-soft">
            {recommendations.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <a
                    href={`/recommendations/${r.id}`}
                    className="text-sm text-ink font-medium hover:text-brand"
                  >
                    {r.title}
                  </a>
                  <div className="text-xs text-ink-faint mt-0.5">
                    {formatNumber(r.audienceSize)} customers
                  </div>
                </div>
                <PriorityBadge priority={r.priority} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
