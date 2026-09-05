import {
  getBusinessMetrics,
  getLifecycleDistribution,
  getTopCustomers,
  getAtRiskCustomers,
  getSecondPurchaseCandidates,
  getProductPurchasePatterns,
  type BusinessMetrics,
  type LifecycleDistribution,
  type CustomerSummary,
  type AtRiskCustomer,
  type ProductPurchasePattern,
} from "@/lib/intelligence";
import { getRecommendations, type Recommendation } from "@/lib/recommendations";

export interface DeterministicInsight {
  id: string;
  text: string;
}

export interface DashboardData {
  metrics: BusinessMetrics;
  lifecycle: LifecycleDistribution[];
  topCustomers: CustomerSummary[];
  atRiskCustomers: AtRiskCustomer[];
  secondPurchaseCandidates: CustomerSummary[];
  topAffinity: ProductPurchasePattern | null;
  insights: DeterministicInsight[];
  topRecommendations: Recommendation[];
}

/**
 * Single entry point for the dashboard route. Combines every Phase 2
 * intelligence query the UI needs into one structured payload, so
 * components consume data rather than each making their own
 * database calls (avoids N+1 queries from the page).
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [metrics, lifecycle, topCustomers, atRiskCustomers, secondPurchaseCandidates, patterns, recommendations] =
    await Promise.all([
      getBusinessMetrics(),
      getLifecycleDistribution(),
      getTopCustomers(5),
      getAtRiskCustomers(5),
      getSecondPurchaseCandidates(),
      getProductPurchasePatterns(20),
      getRecommendations(),
    ]);

  // Strongest cross-sell signal among products with enough sample size,
  // used both for an insight card and as context for "second purchase" copy.
  const topAffinity =
    patterns
      .filter((p) => p.topNextProducts.length > 0)
      .sort((a, b) => (b.topNextProducts[0]?.conversionRate ?? 0) - (a.topNextProducts[0]?.conversionRate ?? 0))[0] ??
    null;

  const insights = buildDeterministicInsights(metrics, secondPurchaseCandidates.length, topAffinity);

  return {
    metrics,
    lifecycle,
    topCustomers,
    atRiskCustomers,
    secondPurchaseCandidates,
    topAffinity,
    insights,
    // Recommendations are already sorted by priority — surface just
    // the top few so the dashboard doesn't overwhelm the merchant.
    topRecommendations: recommendations.slice(0, 3),
  };
}

/**
 * Deterministic, data-derived insight sentences — a stand-in for the
 * Phase 5 AI-generated insights. Every number here is pulled from
 * the same intelligence engine the rest of the dashboard uses; none
 * of this is hardcoded or invented.
 */
function buildDeterministicInsights(
  metrics: BusinessMetrics,
  secondPurchaseCandidateCount: number,
  topAffinity: ProductPurchasePattern | null
): DeterministicInsight[] {
  const insights: DeterministicInsight[] = [];

  if (metrics.totalRevenue > 0) {
    const pct = Math.round(
      (metrics.returningCustomerRevenue / metrics.totalRevenue) * 100
    );
    insights.push({
      id: "returning-revenue-share",
      text: `Returning customers generate ${pct}% of total revenue, from ${metrics.returningCustomers.toLocaleString(
        "en-IN"
      )} customers who've purchased more than once.`,
    });
  }

  if (secondPurchaseCandidateCount > 0) {
    insights.push({
      id: "second-purchase-pool",
      text: `${secondPurchaseCandidateCount.toLocaleString(
        "en-IN"
      )} customers made a first purchase recently but haven't returned yet — a live opportunity for a second-purchase campaign.`,
    });
  }

  if (topAffinity && topAffinity.topNextProducts.length > 0) {
    const next = topAffinity.topNextProducts[0];
    const pct = Math.round(next.conversionRate * 100);
    insights.push({
      id: "top-affinity",
      text: `${topAffinity.product} customers frequently buy ${next.product} next — ${pct}% of ${topAffinity.product} buyers went on to purchase it.`,
    });
  }

  return insights;
}
