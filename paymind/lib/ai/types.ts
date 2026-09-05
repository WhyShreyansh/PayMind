export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Session-level follow-up context (not persisted server-side — the
 * client sends this back on every request, per the Phase 5 spec's
 * "session-level state is enough, no persistent history yet"). */
export interface AssistantContext {
  lastAudience: { label: string; count: number; exploreHref: string } | null;
  lastCustomerId: string | null;
  lastCustomerName: string | null;
  lastProduct: string | null;
}

export const EMPTY_CONTEXT: AssistantContext = {
  lastAudience: null,
  lastCustomerId: null,
  lastCustomerName: null,
  lastProduct: null,
};

export type AnswerCard =
  | { type: "metric"; label: string; value: string; sub?: string }
  | { type: "audience"; label: string; count: number; exploreHref: string }
  | {
      type: "customerList";
      label: string;
      total: number;
      sample: { id: string; name: string; totalSpent: number; purchaseCount: number }[];
    }
  | {
      type: "customer";
      id: string;
      name: string;
      totalSpent: number;
      purchaseCount: number;
      lifecycle: string;
      href: string;
    }
  | {
      type: "productAffinity";
      fromProduct: string;
      toProduct: string;
      conversionRatePct: number;
      coBuyers: number;
    }
  | {
      type: "recommendation";
      id: string;
      title: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
      audienceSize: number;
      reason: string;
      recommendedProduct: string | null;
      suggestedOffer: string;
      exploreHref: string;
      detailHref: string;
    };

export interface AssistantApiResponse {
  reply: string;
  context: AssistantContext;
  card: AnswerCard | null;
  toolsUsed: string[];
}

export interface AssistantApiError {
  error: string;
}
