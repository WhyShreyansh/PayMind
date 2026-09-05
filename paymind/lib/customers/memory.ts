import { getCustomerSummaryById } from "@/lib/intelligence";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CustomerMemory } from "./types";

const SEGMENT_LABEL: Record<string, string> = {
  NEW: "new",
  SECOND_PURCHASE: "returning",
  REPEAT: "repeat",
  LOYAL: "loyal",
  AT_RISK: "previously active",
  CHURNED: "lapsed",
  NO_PURCHASE: "prospective",
};

/**
 * Deterministic "Customer Memory" — a natural-language paragraph and
 * structured facts built entirely from this customer's real data.
 * No LLM call. Every clause below is conditioned on data actually
 * being present; nothing here is invented when history is thin.
 */
export async function getCustomerMemory(customerId: string): Promise<CustomerMemory | null> {
  const c = await getCustomerSummaryById(customerId);
  if (!c) return null;

  if (c.purchaseCount === 0) {
    return {
      summary: `${c.name} hasn't completed a purchase yet, so there isn't enough history to build a customer memory.`,
      facts: [
        { label: "First purchase", value: "Not enough purchase history" },
        { label: "Purchases", value: "0" },
        { label: "Lifetime spend", value: "Not enough purchase history" },
        { label: "Average purchase interval", value: "Not enough purchase history" },
        { label: "Favorite category", value: "Not enough purchase history" },
        { label: "Favorite product", value: "Not enough purchase history" },
        { label: "Last purchase", value: "Not enough purchase history" },
        { label: "Current status", value: "No purchases yet" },
      ],
    };
  }

  const segmentLabel = SEGMENT_LABEL[c.lifecycleSegment] ?? c.lifecycleSegment.toLowerCase();
  const sentences: string[] = [];

  sentences.push(
    `${c.name} is a ${segmentLabel} GlowSkin customer with ${c.purchaseCount} successful ${
      c.purchaseCount === 1 ? "purchase" : "purchases"
    } and ${formatCurrency(c.totalSpent)} in lifetime spend.`
  );

  if (c.avgPurchaseIntervalDays !== null) {
    sentences.push(
      `They typically purchase every ${Math.round(c.avgPurchaseIntervalDays)} days.`
    );
  } else {
    sentences.push(
      "They've made one purchase so far, so there isn't yet enough history to establish a purchase cycle."
    );
  }

  if (c.favoriteProduct) {
    const categoryClause =
      c.favoriteCategory && c.favoriteCategory !== c.favoriteProduct
        ? ` in the ${c.favoriteCategory} category`
        : "";
    sentences.push(`They most frequently buy ${c.favoriteProduct}${categoryClause}.`);
  }

  if (c.daysSinceLastPurchase !== null) {
    let recencyClause = `Their most recent purchase was ${c.daysSinceLastPurchase} days ago`;
    if (c.lifecycleSegment === "AT_RISK") {
      recencyClause += ", longer than their usual cycle — a potential reactivation candidate.";
    } else if (c.lifecycleSegment === "CHURNED") {
      recencyClause += ", well beyond their usual buying pattern.";
    } else if (c.lifecycleSegment === "NEW") {
      recencyClause += ", and they're still within a typical window to return for a second purchase.";
    } else {
      recencyClause += ".";
    }
    sentences.push(recencyClause);
  }

  const facts = [
    {
      label: "First purchase",
      value: c.firstPurchaseDate ? formatDate(c.firstPurchaseDate) : "Not enough purchase history",
    },
    { label: "Purchases", value: String(c.purchaseCount) },
    { label: "Lifetime spend", value: formatCurrency(c.totalSpent) },
    {
      label: "Average purchase interval",
      value:
        c.avgPurchaseIntervalDays !== null
          ? `${Math.round(c.avgPurchaseIntervalDays)} days`
          : "Not enough purchase history",
    },
    { label: "Favorite category", value: c.favoriteCategory ?? "Not enough purchase history" },
    { label: "Favorite product", value: c.favoriteProduct ?? "Not enough purchase history" },
    {
      label: "Last purchase",
      value: c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : "Not enough purchase history",
    },
    { label: "Current status", value: segmentLabel[0].toUpperCase() + segmentLabel.slice(1) },
  ];

  return { summary: sentences.join(" "), facts };
}
