/**
 * Every PayMind AI tool returns one of these shapes — always
 * structured JSON, never a free-form string. This is what makes the
 * anti-hallucination guarantee enforceable: the LLM explains numbers
 * that came back from here, it never computes them itself.
 */

export interface ToolCustomerRecord {
  id: string;
  name: string;
  email: string;
  purchaseCount: number;
  totalSpent: number;
  avgOrderValue: number;
  lastPurchaseDate: string | null;
  daysSinceLastPurchase: number | null;
  lifecycle: string;
}

export interface AtRiskToolCustomerRecord extends ToolCustomerRecord {
  daysOverdue: number;
  expectedCycleDays: number;
  reason: string;
}

export interface ToolError {
  error: true;
  message: string;
}

export type ToolResult<T> = T | ToolError;

/** Every tool call also carries enough metadata for the API route to
 * deterministically pick a UI answer card — never left to the LLM. */
export interface ToolInvocationMeta {
  toolName: string;
  args: Record<string, unknown>;
}
