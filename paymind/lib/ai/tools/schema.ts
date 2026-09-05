import type OpenAI from "openai";

type ToolDef = OpenAI.Chat.Completions.ChatCompletionTool;

/**
 * These are the ONLY functions the model can call. There is no raw
 * SQL tool, no "run query" tool, nothing that reaches the database
 * except through the named, parameter-validated functions in
 * lib/ai/tools/definitions.ts.
 */
export const PAYMIND_TOOLS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "getBusinessMetrics",
      description:
        "Get overall business metrics: total/new/returning customers, purchase-count breakdown (one-time, two-time, three-time, 4+), repeat purchase rate, total revenue, returning-customer revenue, average order value, average customer lifetime value.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getTopCustomers",
      description: "Get the highest lifetime-value customers, sorted by total spend descending.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max customers to return (default 5, max 20)." },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAtRiskCustomers",
      description:
        "Get customers who have purchased multiple times but are now significantly overdue relative to their own typical repurchase cycle. Includes a human-readable reason for each.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max customers to return (default 10, max 20)." },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getSecondPurchaseCandidates",
      description:
        "Get customers with exactly one purchase who are still within a normal window to return (i.e. not yet churned) — the audience for a 'second purchase' campaign. Also returns the most common first product bought by this audience and a deterministic recommended next product.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description:
              "Max customer records to return in the sample (default 20, max 20). The 'total' field always reflects the true audience size regardless of this limit.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCustomersByProduct",
      description:
        "Get customers who purchased a given product. Optionally exclude customers who also purchased a second product — use this for cross-sell questions like 'who bought Face Wash but never bought Serum'.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "Exact product name, e.g. 'Face Wash'." },
          excludeProductName: {
            type: "string",
            description: "Optional: exclude customers who also purchased this product.",
          },
          limit: { type: "number", description: "Max customer records to sample (default 20, max 20)." },
        },
        required: ["productName"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCustomerProfile",
      description:
        "Get the complete profile for one specific customer by ID: purchase stats, lifecycle, behavior, product history, recent orders, the deterministic customer-memory summary, and the next-best behavior-based opportunity. Use searchCustomers first if you only have a name.",
      parameters: {
        type: "object",
        properties: {
          customerId: { type: "string", description: "The customer's UUID." },
        },
        required: ["customerId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchCustomers",
      description:
        "Search for customers by name, email, or phone. Use this to resolve a customer's ID from a name before calling getCustomerProfile. If more than one match is returned, ask the merchant which one they mean instead of guessing.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Name, email, or phone fragment to search for." },
          limit: { type: "number", description: "Max results (default 5)." },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductPurchasePatterns",
      description:
        "Get deterministic cross-sell affinity: for a given product, which products its buyers most often purchase next, with conversion rates based on real purchase sequences. Omit productName to get the overall ranked list across all products with enough sample size.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "Optional: a specific product name." },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getReturningCustomerRevenue",
      description:
        "Get the revenue split between new and returning customers, and what percentage of total revenue returning customers represent.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "getCustomersByLifecycle",
      description:
        "Get customers in a specific lifecycle segment: NEW, SECOND_PURCHASE, REPEAT, LOYAL, AT_RISK, or CHURNED.",
      parameters: {
        type: "object",
        properties: {
          lifecycle: {
            type: "string",
            enum: ["NEW", "SECOND_PURCHASE", "REPEAT", "LOYAL", "AT_RISK", "CHURNED"],
          },
          limit: { type: "number", description: "Max customer records to sample (default 20, max 20)." },
        },
        required: ["lifecycle"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getRecommendations",
      description:
        "Get PayMind's deterministic 'who should I target' recommendations: prioritized customer-audience opportunities, each with a reason, a recommended product (from observed purchase patterns), and a suggested offer. Use this for questions like 'who should I target', 'what should I do next', 'why should I target these customers', 'what should I sell them', or 'what offer should I give them'. Sorted by priority (HIGH first) already — for 'what should I do next', just use the first result.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "Optional: filter to one recommendation type.",
            enum: ["SECOND_PURCHASE", "AT_RISK", "CROSS_SELL", "CHURNED_REACTIVATION", "LOYAL_ENGAGEMENT"],
          },
          priority: {
            type: "string",
            description: "Optional: filter to one priority level.",
            enum: ["HIGH", "MEDIUM", "LOW"],
          },
          limit: { type: "number", description: "Max recommendations to return (default 5)." },
        },
        additionalProperties: false,
      },
    },
  },
];
