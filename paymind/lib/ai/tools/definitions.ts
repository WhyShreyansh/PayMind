import {
  getBusinessMetrics as intelGetBusinessMetrics,
  getTopCustomers as intelGetTopCustomers,
  getAtRiskCustomers as intelGetAtRiskCustomers,
  getSecondPurchaseCandidates as intelGetSecondPurchaseCandidates,
  getCustomersByProduct as intelGetCustomersByProduct,
  getProductPurchasePatterns as intelGetProductPurchasePatterns,
  getReturningCustomerRevenue as intelGetReturningCustomerRevenue,
} from "@/lib/intelligence";
import type { CustomerSummary, ExtendedLifecycleSegment } from "@/lib/intelligence";
import { listCustomers, getCustomerDetail } from "@/lib/customers";
import { getRecommendations } from "@/lib/recommendations";
import type { ToolCustomerRecord, AtRiskToolCustomerRecord, ToolResult } from "./types";

const MAX_SAMPLE = 20;

function toRecord(c: CustomerSummary): ToolCustomerRecord {
  return {
    id: c.customerId,
    name: c.name,
    email: c.email,
    purchaseCount: c.purchaseCount,
    totalSpent: c.totalSpent,
    avgOrderValue: c.avgOrderValue,
    lastPurchaseDate: c.lastPurchaseDate,
    daysSinceLastPurchase: c.daysSinceLastPurchase,
    lifecycle: c.lifecycleSegment,
  };
}

function clampLimit(limit: unknown, fallback: number, max = MAX_SAMPLE): number {
  const n = typeof limit === "number" ? limit : parseInt(String(limit ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

// ---------------------------------------------------------------------
// 1. Business metrics
// ---------------------------------------------------------------------
export async function toolGetBusinessMetrics() {
  return intelGetBusinessMetrics();
}

// ---------------------------------------------------------------------
// 2. Top customers
// ---------------------------------------------------------------------
export async function toolGetTopCustomers(args: { limit?: number }) {
  const limit = clampLimit(args.limit, 5);
  const customers = await intelGetTopCustomers(limit);
  return { count: customers.length, customers: customers.map(toRecord) };
}

// ---------------------------------------------------------------------
// 3. At-risk customers
// ---------------------------------------------------------------------
export async function toolGetAtRiskCustomers(args: { limit?: number }) {
  const limit = clampLimit(args.limit, 10);
  // Fetch the full at-risk list (Phase 2's function accepts a limit,
  // so we pass a high ceiling) so we can report the true audience
  // size, not just the sample we return records for.
  const all = await intelGetAtRiskCustomers(5000);
  const sample = all.slice(0, limit);
  const records: AtRiskToolCustomerRecord[] = sample.map((c) => ({
    ...toRecord(c),
    daysOverdue: c.daysOverdue,
    expectedCycleDays: c.expectedCycleDays,
    reason: `Usually repurchases every ~${c.expectedCycleDays} days; it has been ${c.daysSinceLastPurchase} days since their last purchase (${c.daysOverdue} days overdue).`,
  }));
  return { total: all.length, customers: records };
}

// ---------------------------------------------------------------------
// 4. Second-purchase candidates
// ---------------------------------------------------------------------
export async function toolGetSecondPurchaseCandidates(args: { limit?: number }) {
  const limit = clampLimit(args.limit, 20);
  const all = await intelGetSecondPurchaseCandidates();
  const sample = all.slice(0, limit);

  // Deterministic "recommended product" for the whole audience: the
  // most common favorite product among candidates, then its
  // strongest next-purchase affinity (same signal the dashboard uses).
  const productCounts = new Map<string, number>();
  for (const c of all) {
    if (c.favoriteProduct) {
      productCounts.set(c.favoriteProduct, (productCounts.get(c.favoriteProduct) ?? 0) + 1);
    }
  }
  const topProduct = [...productCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  let recommendedProduct: string | null = null;
  if (topProduct) {
    const patterns = await intelGetProductPurchasePatterns(1);
    const pattern = patterns.find((p) => p.product === topProduct);
    recommendedProduct = pattern?.topNextProducts[0]?.product ?? null;
  }

  return {
    total: all.length,
    customers: sample.map(toRecord),
    mostCommonFirstProduct: topProduct,
    recommendedNextProduct: recommendedProduct,
  };
}

// ---------------------------------------------------------------------
// 5. Customers by product (and the Face-Wash-but-not-Serum pattern)
// ---------------------------------------------------------------------
export async function toolGetCustomersByProduct(args: {
  productName: string;
  excludeProductName?: string;
  limit?: number;
}): Promise<ToolResult<{
  productName: string;
  excludedProduct: string | null;
  total: number;
  customers: ToolCustomerRecord[];
}>> {
  const { productName, excludeProductName } = args;
  if (!productName) {
    return { error: true, message: "A product name is required." };
  }
  const limit = clampLimit(args.limit, 20);

  const buyers = await intelGetCustomersByProduct(productName);
  if (buyers.length === 0) {
    return {
      productName,
      excludedProduct: excludeProductName ?? null,
      total: 0,
      customers: [],
    };
  }

  let result = buyers;
  if (excludeProductName) {
    const excludedBuyers = await intelGetCustomersByProduct(excludeProductName);
    const excludedIds = new Set(excludedBuyers.map((c) => c.customerId));
    result = buyers.filter((c) => !excludedIds.has(c.customerId));
  }

  return {
    productName,
    excludedProduct: excludeProductName ?? null,
    total: result.length,
    customers: result.slice(0, limit).map(toRecord),
  };
}

// ---------------------------------------------------------------------
// 6. Customer profile (full Phase 4 detail)
// ---------------------------------------------------------------------
export async function toolGetCustomerProfile(args: { customerId: string }) {
  if (!args.customerId) {
    return { error: true, message: "A customer ID is required." };
  }
  const detail = await getCustomerDetail(args.customerId);
  if (!detail) {
    return { error: true, message: "No customer found with that ID." };
  }
  return {
    id: detail.summary.customerId,
    name: detail.summary.name,
    email: detail.summary.email,
    purchaseCount: detail.summary.purchaseCount,
    totalSpent: detail.summary.totalSpent,
    avgOrderValue: detail.summary.avgOrderValue,
    firstPurchaseDate: detail.summary.firstPurchaseDate,
    lastPurchaseDate: detail.summary.lastPurchaseDate,
    daysSinceLastPurchase: detail.summary.daysSinceLastPurchase,
    avgPurchaseIntervalDays: detail.summary.avgPurchaseIntervalDays,
    favoriteProduct: detail.summary.favoriteProduct,
    favoriteCategory: detail.summary.favoriteCategory,
    lifecycle: detail.summary.lifecycleSegment,
    productHistory: detail.productHistory.slice(0, 10),
    recentOrders: detail.purchaseHistory.slice(-5).reverse(),
    memory: detail.memory,
    opportunity: detail.opportunity,
  };
}

// ---------------------------------------------------------------------
// 7. Search customers by name/email (for resolving "tell me about Rahul")
// ---------------------------------------------------------------------
export async function toolSearchCustomers(args: { query: string; limit?: number }) {
  if (!args.query || args.query.trim().length === 0) {
    return { error: true, message: "A search query is required." };
  }
  const limit = clampLimit(args.limit, 5);
  const result = await listCustomers({ search: args.query, pageSize: limit });
  return {
    total: result.total,
    customers: result.customers.map(toRecord),
  };
}

// ---------------------------------------------------------------------
// 8. Product purchase patterns
// ---------------------------------------------------------------------
export async function toolGetProductPurchasePatterns(args: { productName?: string }) {
  const patterns = await intelGetProductPurchasePatterns(10);
  if (args.productName) {
    const match = patterns.find(
      (p) => p.product.toLowerCase() === args.productName!.toLowerCase()
    );
    if (!match) {
      return {
        error: true,
        message: `No purchase pattern data found for "${args.productName}".`,
      };
    }
    return match;
  }
  return { patterns: patterns.slice(0, 10) };
}

// ---------------------------------------------------------------------
// 9. Returning customer revenue
// ---------------------------------------------------------------------
export async function toolGetReturningCustomerRevenue() {
  return intelGetReturningCustomerRevenue();
}

// ---------------------------------------------------------------------
// 10. Customers by lifecycle segment
// ---------------------------------------------------------------------
const VALID_LIFECYCLES: ExtendedLifecycleSegment[] = [
  "NEW",
  "SECOND_PURCHASE",
  "REPEAT",
  "LOYAL",
  "AT_RISK",
  "CHURNED",
];

export async function toolGetCustomersByLifecycle(args: { lifecycle: string; limit?: number }) {
  const lifecycle = args.lifecycle?.toUpperCase();
  if (!VALID_LIFECYCLES.includes(lifecycle as ExtendedLifecycleSegment)) {
    return {
      error: true,
      message: `"${args.lifecycle}" isn't a valid lifecycle segment. Valid values: ${VALID_LIFECYCLES.join(", ")}.`,
    };
  }
  const limit = clampLimit(args.limit, 20);
  const result = await listCustomers({
    status: lifecycle as ExtendedLifecycleSegment,
    pageSize: limit,
  });
  return {
    lifecycle,
    total: result.total,
    customers: result.customers.map(toRecord),
  };
}

// ---------------------------------------------------------------------
// 11. Recommendations (Phase 6)
// ---------------------------------------------------------------------
export async function toolGetRecommendations(args: {
  type?: string;
  priority?: string;
  limit?: number;
}) {
  let recommendations = await getRecommendations();

  if (args.type) {
    recommendations = recommendations.filter(
      (r) => r.type.toLowerCase() === args.type!.toLowerCase()
    );
  }
  if (args.priority) {
    recommendations = recommendations.filter(
      (r) => r.priority.toLowerCase() === args.priority!.toLowerCase()
    );
  }
  const limit = clampLimit(args.limit, 5);
  const sliced = recommendations.slice(0, limit);

  return {
    count: sliced.length,
    recommendations: sliced.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      priority: r.priority,
      priorityExplanation: r.priorityExplanation,
      audienceSize: r.audienceSize,
      reason: r.reason,
      recommendedProduct: r.recommendedProduct?.name ?? null,
      productReason: r.recommendedProduct?.reason ?? null,
      suggestedOffer: r.suggestedOffer.label,
      exploreHref: r.exploreHref,
      metrics: r.metrics,
    })),
  };
}
