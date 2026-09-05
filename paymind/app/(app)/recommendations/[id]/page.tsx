import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getRecommendationById } from "@/lib/recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PriorityBadge } from "@/components/recommendations/priority-badge";
import { RecommendationMetricsCards } from "@/components/recommendations/recommendation-metrics";
import { RecommendationCustomers } from "@/components/recommendations/recommendation-customers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecommendationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const r = await getRecommendationById(id);

  if (!r) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/recommendations"
        className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink mb-4"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All recommendations
      </Link>

      <div className="flex items-start justify-between gap-3 mb-6">
        <h1 className="font-serif-display text-2xl text-ink">{r.title}</h1>
        <PriorityBadge priority={r.priority} />
      </div>

      <div className="mb-4">
        <RecommendationMetricsCards recommendation={r} />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Why PayMind recommends this</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink leading-relaxed">{r.reason}</p>
          <p className="text-xs text-ink-faint mt-2">{r.priorityExplanation}</p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Product opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            {r.recommendedProduct ? (
              <>
                <div className="text-ink font-medium">{r.recommendedProduct.name}</div>
                <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
                  {r.recommendedProduct.reason}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-soft">
                No clear next-product recommendation from current purchase history.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggested offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-ink font-medium">{r.suggestedOffer.label}</div>
            <p className="text-xs text-ink-faint mt-1.5">
              A suggested starting point, not a guaranteed-optimal offer.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <RecommendationCustomers recommendation={r} />
      </div>

      <Card>
        <CardContent className="py-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-ink font-medium">Next action</div>
            <div className="text-xs text-ink-faint mt-0.5">
              Creating a Razorpay Payment Link for this offer is coming in a later phase.
            </div>
          </div>
          <LinkButton href={r.exploreHref} size="sm">
            View Customers
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
