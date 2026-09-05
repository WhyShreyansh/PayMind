import { formatCurrencyCompact, formatPercent } from "@/lib/utils";
import type { AnswerCard, AssistantContext } from "./types";

/**
 * Builds the UI answer card directly from a tool's raw JSON result —
 * never from the LLM's prose. This is what keeps card numbers
 * grounded: if the card says "612 customers", that number came
 * straight out of the tool call, the model never touched it.
 *
 * Also returns the context patch to merge into AssistantContext, so
 * follow-up questions ("what should I sell them?") can resolve
 * pronouns against the audience/customer/product this call surfaced.
 */
export function buildCardAndContext(
  toolName: string,
  args: Record<string, unknown>,
  result: unknown
): { card: AnswerCard | null; contextPatch: Partial<AssistantContext> } {
  if (!result || typeof result !== "object" || (result as { error?: boolean }).error) {
    return { card: null, contextPatch: {} };
  }
  const r = result as Record<string, unknown>;

  switch (toolName) {
    case "getTopCustomers": {
      const count = r.count as number;
      if (!count) return { card: null, contextPatch: {} };
      const exploreHref = "/customers";
      return {
        card: { type: "audience", label: "Top customers", count, exploreHref },
        contextPatch: { lastAudience: { label: "top customers", count, exploreHref } },
      };
    }

    case "getAtRiskCustomers": {
      const total = r.total as number;
      const exploreHref = "/customers?status=AT_RISK";
      return {
        card: total > 0 ? { type: "audience", label: "At-risk customers", count: total, exploreHref } : null,
        contextPatch: total > 0 ? { lastAudience: { label: "at-risk customers", count: total, exploreHref } } : {},
      };
    }

    case "getSecondPurchaseCandidates": {
      const total = r.total as number;
      const exploreHref = "/customers?status=NEW&purchaseCount=1";
      return {
        card:
          total > 0
            ? { type: "audience", label: "Second-purchase candidates", count: total, exploreHref }
            : null,
        contextPatch:
          total > 0
            ? {
                lastAudience: { label: "second-purchase candidates", count: total, exploreHref },
                lastProduct: (r.recommendedNextProduct as string | null) ?? undefined,
              }
            : {},
      };
    }

    case "getCustomersByProduct": {
      const total = r.total as number;
      const productName = r.productName as string;
      const excluded = r.excludedProduct as string | null;
      const sample = ((r.customers as { id: string; name: string; totalSpent: number; purchaseCount: number }[]) ?? []).slice(0, 5);
      const label = excluded
        ? `${productName} buyers who haven't bought ${excluded}`
        : `${productName} buyers`;
      return {
        card: total > 0 ? { type: "customerList", label, total, sample } : null,
        contextPatch: { lastProduct: productName },
      };
    }

    case "getCustomerProfile": {
      if (!r.id) return { card: null, contextPatch: {} };
      return {
        card: {
          type: "customer",
          id: r.id as string,
          name: r.name as string,
          totalSpent: r.totalSpent as number,
          purchaseCount: r.purchaseCount as number,
          lifecycle: r.lifecycle as string,
          href: `/customers/${r.id}`,
        },
        contextPatch: { lastCustomerId: r.id as string, lastCustomerName: r.name as string },
      };
    }

    case "searchCustomers": {
      const customers = (r.customers as { id: string; name: string; totalSpent: number; purchaseCount: number; lifecycle: string }[]) ?? [];
      if (customers.length !== 1) return { card: null, contextPatch: {} };
      const c = customers[0];
      return {
        card: {
          type: "customer",
          id: c.id,
          name: c.name,
          totalSpent: c.totalSpent,
          purchaseCount: c.purchaseCount,
          lifecycle: c.lifecycle,
          href: `/customers/${c.id}`,
        },
        contextPatch: { lastCustomerId: c.id, lastCustomerName: c.name },
      };
    }

    case "getProductPurchasePatterns": {
      const productName = args.productName as string | undefined;
      if (!productName || !r.product) return { card: null, contextPatch: {} };
      const top = (r.topNextProducts as { product: string; coBuyers: number; conversionRate: number }[])?.[0];
      if (!top) return { card: null, contextPatch: { lastProduct: productName } };
      return {
        card: {
          type: "productAffinity",
          fromProduct: productName,
          toProduct: top.product,
          conversionRatePct: Math.round(top.conversionRate * 100),
          coBuyers: top.coBuyers,
        },
        contextPatch: { lastProduct: productName },
      };
    }

    case "getReturningCustomerRevenue": {
      const returning = r.returningCustomerRevenue as number;
      const pct = r.returningRevenuePercentage as number;
      return {
        card: {
          type: "metric",
          label: "Returning customer revenue",
          value: formatCurrencyCompact(returning),
          sub: `${formatPercent(pct)} of total revenue`,
        },
        contextPatch: {},
      };
    }

    case "getCustomersByLifecycle": {
      const total = r.total as number;
      const lifecycle = r.lifecycle as string;
      const exploreHref = `/customers?status=${lifecycle}`;
      return {
        card:
          total > 0
            ? { type: "audience", label: `${lifecycle.replace("_", " ").toLowerCase()} customers`, count: total, exploreHref }
            : null,
        contextPatch:
          total > 0 ? { lastAudience: { label: `${lifecycle} customers`, count: total, exploreHref } } : {},
      };
    }

    case "getRecommendations": {
      const recs = (r.recommendations as {
        id: string;
        title: string;
        priority: "HIGH" | "MEDIUM" | "LOW";
        audienceSize: number;
        reason: string;
        recommendedProduct: string | null;
        suggestedOffer: string;
        exploreHref: string;
      }[]) ?? [];
      if (recs.length === 0) return { card: null, contextPatch: {} };
      // Always card the top (highest-priority) recommendation — the
      // one the model is most likely explaining in its reply.
      const top = recs[0];
      return {
        card: {
          type: "recommendation",
          id: top.id,
          title: top.title,
          priority: top.priority,
          audienceSize: top.audienceSize,
          reason: top.reason,
          recommendedProduct: top.recommendedProduct,
          suggestedOffer: top.suggestedOffer,
          exploreHref: top.exploreHref,
          detailHref: `/recommendations/${top.id}`,
        },
        contextPatch: {
          lastAudience: { label: top.title, count: top.audienceSize, exploreHref: top.exploreHref },
          lastProduct: top.recommendedProduct ?? undefined,
        },
      };
    }

    default:
      return { card: null, contextPatch: {} };
  }
}
