import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getRecommendations } from "@/lib/recommendations";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const recommendations = await getRecommendations();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif-display text-[26px] text-ink">Who should I target?</h1>
        <p className="text-ink-soft text-sm mt-1">
          PayMind found these customer opportunities from your transaction data.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-8 w-8 text-ink-faint mx-auto" strokeWidth={1.5} />
            <h2 className="text-ink font-medium mt-3">No strong opportunities right now</h2>
            <p className="text-sm text-ink-soft mt-1.5 max-w-sm mx-auto">
              PayMind couldn&apos;t find a large actionable customer opportunity from your
              current purchase history. Check back as more transactions come in.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations.map((r) => (
            <RecommendationCard key={r.id} recommendation={r} />
          ))}
        </div>
      )}
    </div>
  );
}
