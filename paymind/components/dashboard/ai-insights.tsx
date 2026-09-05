import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { DeterministicInsight } from "@/lib/dashboard/get-dashboard-data";

/**
 * Deterministic, data-derived insights — NOT calling an LLM. The
 * sentences are built in lib/dashboard/get-dashboard-data.ts from
 * the same Phase 2 intelligence functions the rest of the dashboard
 * uses. This component just renders whatever list it's given, so
 * swapping in Phase 5's OpenAI-generated insights later only means
 * changing where `insights` comes from — not this component.
 */
export function AiInsights({ insights }: { insights: DeterministicInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Patterns spotted in your customer data</CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Not enough data yet to surface insights.
          </p>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight) => (
              <li key={insight.id} className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-brand shrink-0 mt-0.5" strokeWidth={1.75} />
                <span className="text-sm text-ink leading-relaxed">{insight.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
