import { getAllCustomerSummaries } from "./queries";
import type { BusinessMetrics, LifecycleDistribution } from "./types";

/**
 * Aggregate business metrics. Everything here is derived from
 * getAllCustomerSummaries() — one query, computed in memory — so the
 * dashboard, AI tools, and anything else that needs these numbers
 * all see the exact same source of truth.
 */
export async function getBusinessMetrics(): Promise<BusinessMetrics> {
  const customers = await getAllCustomerSummaries();
  const purchasers = customers.filter((c) => c.purchaseCount > 0);

  const totalCustomers = purchasers.length;
  const newCustomers = purchasers.filter((c) => c.lifecycleSegment === "NEW").length;
  const oneTimeBuyers = purchasers.filter((c) => c.purchaseCount === 1).length;
  const secondTimeBuyers = purchasers.filter((c) => c.purchaseCount === 2).length;
  const thirdTimeBuyers = purchasers.filter((c) => c.purchaseCount === 3).length;
  const fourPlusBuyers = purchasers.filter((c) => c.purchaseCount >= 4).length;
  const returningCustomers = purchasers.filter((c) => c.purchaseCount >= 2).length;

  const totalRevenue = purchasers.reduce((sum, c) => sum + c.totalSpent, 0);
  const returningCustomerRevenue = purchasers
    .filter((c) => c.purchaseCount >= 2)
    .reduce((sum, c) => sum + c.totalSpent, 0);
  const newCustomerRevenue = totalRevenue - returningCustomerRevenue;

  const totalOrders = purchasers.reduce((sum, c) => sum + c.purchaseCount, 0);

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    oneTimeBuyers,
    secondTimeBuyers,
    thirdTimeBuyers,
    fourPlusBuyers,
    repeatPurchaseRate: totalCustomers > 0 ? returningCustomers / totalCustomers : 0,
    totalRevenue,
    returningCustomerRevenue,
    newCustomerRevenue,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    averageCustomerLifetimeValue: totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
  };
}

/** Revenue split, isolated for callers (like the dashboard's revenue
 * breakdown card) that only need this slice of getBusinessMetrics(). */
export async function getReturningCustomerRevenue(): Promise<{
  returningCustomerRevenue: number;
  newCustomerRevenue: number;
  totalRevenue: number;
  returningRevenuePercentage: number;
}> {
  const metrics = await getBusinessMetrics();
  return {
    returningCustomerRevenue: metrics.returningCustomerRevenue,
    newCustomerRevenue: metrics.newCustomerRevenue,
    totalRevenue: metrics.totalRevenue,
    returningRevenuePercentage:
      metrics.totalRevenue > 0
        ? metrics.returningCustomerRevenue / metrics.totalRevenue
        : 0,
  };
}

export async function getLifecycleDistribution(): Promise<LifecycleDistribution[]> {
  const customers = await getAllCustomerSummaries();
  const purchasers = customers.filter((c) => c.purchaseCount > 0);
  const total = purchasers.length;

  const segments = ["NEW", "SECOND_PURCHASE", "REPEAT", "LOYAL", "AT_RISK", "CHURNED"] as const;

  return segments.map((segment) => {
    const count = purchasers.filter((c) => c.lifecycleSegment === segment).length;
    return {
      segment,
      count,
      percentage: total > 0 ? count / total : 0,
    };
  });
}
