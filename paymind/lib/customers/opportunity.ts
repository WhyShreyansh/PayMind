import { getCustomerSummaryById, getProductPurchasePatterns } from "@/lib/intelligence";
import { formatCurrency } from "@/lib/utils";
import type { CustomerOpportunity } from "./types";

/**
 * Deterministic, rule-based "next best opportunity" — explicitly
 * NOT AI. Reuses Phase 2's getProductPurchasePatterns() for the
 * recommended-product signal. This is the seam Phase 6's AI
 * recommendation engine will eventually plug into; the UI already
 * labels it "Behavior-based opportunity" so it's never confused
 * with an AI-generated suggestion.
 */
export async function getCustomerOpportunity(
  customerId: string
): Promise<CustomerOpportunity | null> {
  const c = await getCustomerSummaryById(customerId);
  if (!c) return null;

  if (c.purchaseCount === 0) {
    return {
      kind: "NONE",
      label: "No purchase history",
      description: "This customer hasn't purchased yet, so there's no behavior to base an opportunity on.",
      recommendedProduct: null,
    };
  }

  if (c.purchaseCount === 1 && c.lifecycleSegment === "NEW") {
    const patterns = await getProductPurchasePatterns(10);
    const boughtProduct = c.favoriteProduct;
    const pattern = patterns.find((p) => p.product === boughtProduct);
    const nextProduct = pattern?.topNextProducts[0]?.product ?? null;

    return {
      kind: "SECOND_PURCHASE",
      label: "Potential second purchase",
      description: nextProduct
        ? `Customers who bought ${boughtProduct} frequently purchased ${nextProduct} next.`
        : `${c.name} made a first purchase and hasn't returned yet — a candidate for a second-purchase nudge.`,
      recommendedProduct: nextProduct,
    };
  }

  if (c.lifecycleSegment === "AT_RISK" || c.lifecycleSegment === "CHURNED") {
    return {
      kind: "REACTIVATION",
      label: "Potential reactivation",
      description: `${c.name} is ${Math.round(
        c.daysSinceLastPurchase ?? 0
      )} days since their last purchase, beyond their usual cycle. A reactivation offer could bring them back.`,
      recommendedProduct: c.favoriteProduct,
    };
  }

  if (c.lifecycleSegment === "LOYAL") {
    return {
      kind: "LOYAL",
      label: "Loyal customer",
      description: `${c.name} has made ${c.purchaseCount} purchases worth ${formatCurrency(
        c.totalSpent
      )} lifetime. Prioritize retention over acquisition-style offers.`,
      recommendedProduct: c.favoriteProduct,
    };
  }

  return {
    kind: "NONE",
    label: "Steady customer",
    description: `${c.name} is purchasing within their normal cycle — no immediate action needed.`,
    recommendedProduct: c.favoriteProduct,
  };
}
