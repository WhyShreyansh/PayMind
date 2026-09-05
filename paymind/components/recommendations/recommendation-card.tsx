import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PriorityBadge } from "./priority-badge";
import { formatNumber } from "@/lib/utils";
import type { Recommendation } from "@/lib/recommendations/types";

export function RecommendationCard({ recommendation: r }: { recommendation: Recommendation }) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/recommendations/${r.id}`}
              className="text-[17px] font-medium text-ink hover:text-brand"
            >
              {r.title}
            </Link>
            <div className="text-xs text-ink-faint mt-1">{r.priorityExplanation}</div>
          </div>
          <PriorityBadge priority={r.priority} />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
          <div>
            <div className="text-xs text-ink-faint">Audience</div>
            <div className="text-ink font-medium">{formatNumber(r.audienceSize)} customers</div>
          </div>
          <div>
            <div className="text-xs text-ink-faint">Recommended product</div>
            <div className="text-ink font-medium">{r.recommendedProduct?.name ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-ink-faint">Suggested offer</div>
            <div className="text-ink font-medium">{r.suggestedOffer.label}</div>
          </div>
        </div>

        <p className="text-sm text-ink-soft mt-3 leading-relaxed">{r.reason}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          <LinkButton href={r.exploreHref} variant="secondary" size="sm">
            View Customers
          </LinkButton>
          <LinkButton href={`/recommendations/${r.id}`} size="sm">
            View Recommendation
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
