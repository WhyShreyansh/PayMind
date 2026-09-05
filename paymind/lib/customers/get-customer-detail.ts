import { getCustomerSummaryById } from "@/lib/intelligence";
import { getCustomerPurchaseHistory } from "./purchase-history";
import { getCustomerProductHistory } from "./product-history";
import { getCustomerMemory } from "./memory";
import { getCustomerOpportunity } from "./opportunity";
import type { CustomerDetail } from "./types";

/**
 * Single entry point for /customers/[id], mirroring the dashboard's
 * getDashboardData() pattern from Phase 3: one function, one
 * Promise.all, everything the page needs, no per-component queries.
 * Returns null for a nonexistent/invalid customer ID so the page can
 * render a proper 404 rather than crashing.
 */
export async function getCustomerDetail(customerId: string): Promise<CustomerDetail | null> {
  const summary = await getCustomerSummaryById(customerId);
  if (!summary) return null;

  const [purchaseHistory, productHistory, memory, opportunity] = await Promise.all([
    getCustomerPurchaseHistory(customerId),
    getCustomerProductHistory(customerId),
    getCustomerMemory(customerId),
    getCustomerOpportunity(customerId),
  ]);

  return {
    summary,
    purchaseHistory,
    productHistory,
    memory: memory ?? { summary: "", facts: [] },
    opportunity: opportunity ?? {
      kind: "NONE",
      label: "",
      description: "",
      recommendedProduct: null,
    },
  };
}
