import {
  getAllCustomerSummaries,
  getBusinessMetrics,
  getSecondPurchaseCandidates,
  getAtRiskCustomers,
  getCustomersByProduct,
  getProductPurchasePatterns,
} from "@/lib/intelligence";
import type { CustomerSummary } from "@/lib/intelligence";
import { computePriority } from "./priority";
import { getOfferForType } from "./offer-rules";
import type { Recommendation, RecommendedProduct, RecommendationMetrics } from "./types";

const SAMPLE_SIZE = 10;

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function baseMetrics(customers: CustomerSummary[]): RecommendationMetrics {
  const spends = customers.map((c) => c.totalSpent);
  const days = customers
    .map((c) => c.daysSinceLastPurchase)
    .filter((d): d is number => d !== null);
  return {
    totalValue: spends.reduce((s, n) => s + n, 0),
    avgSpend: avg(spends),
    avgDaysSinceLastPurchase: days.length > 0 ? Math.round(avg(days)) : null,
  };
}

/**
 * Deterministic "what to sell this audience" — reuses Phase 2's
 * observed purchase-sequence affinity. Never picks a product at
 * random: if there's no product with enough sample size in the
 * audience's most common favorite product, it says so plainly.
 */
async function recommendProductForAudience(
  customers: CustomerSummary[]
): Promise<RecommendedProduct | null> {
  const counts = new Map<string, number>();
  for (const c of customers) {
    if (c.favoriteProduct) counts.set(c.favoriteProduct, (counts.get(c.favoriteProduct) ?? 0) + 1);
  }
  const topProduct = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!topProduct) return null;

  const patterns = await getProductPurchasePatterns(10);
  const pattern = patterns.find((p) => p.product === topProduct);
  const next = pattern?.topNextProducts[0];
  if (!next) return null;

  const pct = Math.round(next.conversionRate * 100);
  return {
    name: next.product,
    reason: `Customers who bought ${topProduct} frequently purchased ${next.product} next (${pct}% observed conversion).`,
  };
}

async function buildSecondPurchaseRecommendation(
  totalCustomers: number,
  overallAvgLTV: number
): Promise<Recommendation | null> {
  const candidates = await getSecondPurchaseCandidates();
  if (candidates.length === 0) return null;

  const metrics = baseMetrics(candidates);
  const recommendedProduct = await recommendProductForAudience(candidates);
  const { priority, explanation } = computePriority(
    candidates.length,
    metrics.avgSpend,
    totalCustomers,
    overallAvgLTV
  );

  return {
    id: "second-purchase",
    type: "SECOND_PURCHASE",
    title: "Drive second purchases",
    priority,
    priorityExplanation: explanation,
    audienceSize: candidates.length,
    reason:
      "These customers made exactly one purchase and haven't returned yet. They've already converted once, making them a high-value retention audience while their purchase is still recent enough to be actionable.",
    recommendedProduct,
    suggestedOffer: getOfferForType("SECOND_PURCHASE", recommendedProduct?.name ?? null),
    exploreHref: "/customers?status=NEW&purchaseCount=1",
    metrics,
    customers: candidates.slice(0, SAMPLE_SIZE),
  };
}

async function buildAtRiskRecommendation(
  totalCustomers: number,
  overallAvgLTV: number
): Promise<Recommendation | null> {
  const atRisk = await getAtRiskCustomers(5000);
  if (atRisk.length === 0) return null;

  const metrics = baseMetrics(atRisk);
  const recommendedProduct = await recommendProductForAudience(atRisk);
  const { priority, explanation } = computePriority(
    atRisk.length,
    metrics.avgSpend,
    totalCustomers,
    overallAvgLTV
  );

  return {
    id: "at-risk",
    type: "AT_RISK",
    title: "Win back at-risk customers",
    priority,
    priorityExplanation: explanation,
    audienceSize: atRisk.length,
    reason:
      "These repeat customers have purchased multiple times before but are now significantly overdue relative to their own typical purchase cycle — at risk based on purchase inactivity, not a predicted probability.",
    recommendedProduct,
    suggestedOffer: getOfferForType("AT_RISK", recommendedProduct?.name ?? null),
    exploreHref: "/customers?status=AT_RISK",
    metrics,
    customers: atRisk.slice(0, SAMPLE_SIZE),
  };
}

async function buildCrossSellRecommendation(
  totalCustomers: number,
  overallAvgLTV: number
): Promise<Recommendation | null> {
  const patterns = await getProductPurchasePatterns(20);
  const best = patterns
    .filter((p) => p.topNextProducts.length > 0)
    .sort((a, b) => (b.topNextProducts[0]?.conversionRate ?? 0) - (a.topNextProducts[0]?.conversionRate ?? 0))[0];
  if (!best) return null;

  const fromProduct = best.product;
  const toProduct = best.topNextProducts[0].product;
  const conversionPct = Math.round(best.topNextProducts[0].conversionRate * 100);

  const [fromBuyers, toBuyers] = await Promise.all([
    getCustomersByProduct(fromProduct),
    getCustomersByProduct(toProduct),
  ]);
  const toBuyerIds = new Set(toBuyers.map((c) => c.customerId));
  const opportunity = fromBuyers.filter((c) => !toBuyerIds.has(c.customerId));
  if (opportunity.length === 0) return null;

  const metrics = baseMetrics(opportunity);
  metrics.sourceProductBuyers = fromBuyers.length;
  metrics.alreadyPurchasedRecommended = toBuyers.length;
  const { priority, explanation } = computePriority(
    opportunity.length,
    metrics.avgSpend,
    totalCustomers,
    overallAvgLTV
  );

  return {
    id: `cross-sell-${fromProduct.toLowerCase().replace(/\s+/g, "-")}-${toProduct.toLowerCase().replace(/\s+/g, "-")}`,
    type: "CROSS_SELL",
    title: `Cross-sell ${toProduct} to ${fromProduct} customers`,
    priority,
    priorityExplanation: explanation,
    audienceSize: opportunity.length,
    reason: `Observed purchase pattern: ${conversionPct}% of ${fromProduct} buyers went on to purchase ${toProduct}. These ${formatCount(
      opportunity.length
    )} customers bought ${fromProduct} but haven't purchased ${toProduct} yet.`,
    recommendedProduct: {
      name: toProduct,
      reason: `Purchase behavior suggests ${toProduct} is a natural next product for ${fromProduct} buyers.`,
    },
    suggestedOffer: getOfferForType("CROSS_SELL", toProduct),
    // Phase 4's Customer Explorer doesn't support product-based URL
    // filters yet, so this links to the unfiltered explorer; the
    // sample customers below link directly to their profiles instead.
    exploreHref: "/customers",
    metrics,
    customers: opportunity.slice(0, SAMPLE_SIZE),
  };
}

async function buildChurnedRecommendation(
  totalCustomers: number,
  overallAvgLTV: number
): Promise<Recommendation | null> {
  const all = await getAllCustomerSummaries();
  const churned = all.filter((c) => c.lifecycleSegment === "CHURNED");
  if (churned.length === 0) return null;

  const metrics = baseMetrics(churned);
  const recommendedProduct = await recommendProductForAudience(churned);
  const { priority, explanation } = computePriority(
    churned.length,
    metrics.avgSpend,
    totalCustomers,
    overallAvgLTV
  );

  return {
    id: "churned-reactivation",
    type: "CHURNED_REACTIVATION",
    title: "Reactivate lapsed customers",
    priority,
    priorityExplanation: explanation,
    audienceSize: churned.length,
    reason:
      "These were previously active customers who haven't purchased for a long period relative to their own history. They already have a purchase relationship with GlowSkin, which makes reactivation more tractable than pure acquisition.",
    recommendedProduct,
    suggestedOffer: getOfferForType("CHURNED_REACTIVATION", recommendedProduct?.name ?? null),
    exploreHref: "/customers?status=CHURNED",
    metrics,
    customers: churned.slice(0, SAMPLE_SIZE),
  };
}

async function buildLoyalRecommendation(
  totalCustomers: number,
  overallAvgLTV: number
): Promise<Recommendation | null> {
  const all = await getAllCustomerSummaries();
  const loyal = all.filter((c) => c.lifecycleSegment === "LOYAL");
  if (loyal.length === 0) return null;

  const metrics = baseMetrics(loyal);
  metrics.avgPurchaseCount = Math.round(avg(loyal.map((c) => c.purchaseCount)) * 10) / 10;
  const recommendedProduct = await recommendProductForAudience(loyal);
  const { priority, explanation } = computePriority(
    loyal.length,
    metrics.avgSpend,
    totalCustomers,
    overallAvgLTV
  );

  return {
    id: "loyal-engagement",
    type: "LOYAL_ENGAGEMENT",
    title: "Reward loyal customers",
    priority,
    priorityExplanation: explanation,
    audienceSize: loyal.length,
    reason:
      "These customers have purchased four or more times and represent your most consistent, highest-value relationship with GlowSkin. Recognizing them can reinforce a purchase pattern that's already working.",
    recommendedProduct,
    suggestedOffer: getOfferForType("LOYAL_ENGAGEMENT", recommendedProduct?.name ?? null),
    exploreHref: "/customers?status=LOYAL",
    metrics,
    customers: loyal.slice(0, SAMPLE_SIZE),
  };
}

function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

/**
 * Builds every recommendation type, filters out any with a zero-size
 * audience (nothing to show is not the same as "0 customers" — see
 * empty-state handling in the UI), and sorts by deterministic
 * priority score, highest first.
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  const metrics = await getBusinessMetrics();
  const { totalCustomers, averageCustomerLifetimeValue } = metrics;

  const results = await Promise.all([
    buildSecondPurchaseRecommendation(totalCustomers, averageCustomerLifetimeValue),
    buildAtRiskRecommendation(totalCustomers, averageCustomerLifetimeValue),
    buildCrossSellRecommendation(totalCustomers, averageCustomerLifetimeValue),
    buildChurnedRecommendation(totalCustomers, averageCustomerLifetimeValue),
    buildLoyalRecommendation(totalCustomers, averageCustomerLifetimeValue),
  ]);

  const priorityRank: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return results
    .filter((r): r is Recommendation => r !== null)
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.audienceSize - a.audienceSize);
}

export async function getRecommendationById(id: string): Promise<Recommendation | null> {
  const all = await getRecommendations();
  return all.find((r) => r.id === id) ?? null;
}
