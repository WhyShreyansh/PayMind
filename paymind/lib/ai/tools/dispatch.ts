import * as tools from "./definitions";

const DISPATCH: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  getBusinessMetrics: () => tools.toolGetBusinessMetrics(),
  getTopCustomers: (args) => tools.toolGetTopCustomers(args as { limit?: number }),
  getAtRiskCustomers: (args) => tools.toolGetAtRiskCustomers(args as { limit?: number }),
  getSecondPurchaseCandidates: (args) =>
    tools.toolGetSecondPurchaseCandidates(args as { limit?: number }),
  getCustomersByProduct: (args) =>
    tools.toolGetCustomersByProduct(
      args as { productName: string; excludeProductName?: string; limit?: number }
    ),
  getCustomerProfile: (args) => tools.toolGetCustomerProfile(args as { customerId: string }),
  searchCustomers: (args) => tools.toolSearchCustomers(args as { query: string; limit?: number }),
  getProductPurchasePatterns: (args) =>
    tools.toolGetProductPurchasePatterns(args as { productName?: string }),
  getReturningCustomerRevenue: () => tools.toolGetReturningCustomerRevenue(),
  getCustomersByLifecycle: (args) =>
    tools.toolGetCustomersByLifecycle(args as { lifecycle: string; limit?: number }),
  getRecommendations: (args) =>
    tools.toolGetRecommendations(args as { type?: string; priority?: string; limit?: number }),
};

export const TOOL_NAMES = Object.keys(DISPATCH);

export interface ToolCallResult {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
}

/**
 * The single choke point every tool call passes through. Rejects
 * anything not in DISPATCH (so a hallucinated or injected tool name
 * can never execute), and never lets a tool's internal error leak a
 * raw stack trace back to the model or the merchant.
 */
export async function callTool(toolName: string, rawArgs: string): Promise<ToolCallResult> {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    return {
      toolName,
      args: {},
      result: { error: true, message: "Invalid tool arguments." },
    };
  }

  const handler = DISPATCH[toolName];
  if (!handler) {
    return {
      toolName,
      args,
      result: { error: true, message: `Unknown tool: ${toolName}` },
    };
  }

  try {
    const result = await handler(args);
    return { toolName, args, result };
  } catch (err) {
    console.error(`PayMind AI tool "${toolName}" failed:`, err);
    return {
      toolName,
      args,
      result: {
        error: true,
        message: "PayMind couldn't retrieve that information right now.",
      },
    };
  }
}
