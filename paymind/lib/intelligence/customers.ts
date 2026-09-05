import { getPool } from "@/lib/db/pool";
import { daysOverdue } from "./lifecycle";
import { getAllCustomerSummaries, getCustomerSummaryById } from "./queries";
import type {
  AtRiskCustomer,
  CustomerProfile,
  CustomerSummary,
  PurchaseTimelineEntry,
} from "./types";

export async function getTopCustomers(limit = 5): Promise<CustomerSummary[]> {
  const customers = await getAllCustomerSummaries();
  return customers
    .filter((c) => c.purchaseCount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

/**
 * "Previously purchased multiple times but significantly beyond
 * their normal purchase interval" — see lib/intelligence/lifecycle.ts.
 * Sorted by how many days overdue they are (most overdue first).
 */
export async function getAtRiskCustomers(limit = 20): Promise<AtRiskCustomer[]> {
  const customers = await getAllCustomerSummaries();
  return customers
    .filter((c) => c.lifecycleSegment === "AT_RISK")
    .map((c) => ({
      ...c,
      expectedCycleDays: Math.round(
        c.avgPurchaseIntervalDays ?? 45 // matches INTELLIGENCE_CONFIG.DEFAULT_CYCLE_DAYS
      ),
      daysOverdue: daysOverdue({
        purchaseCount: c.purchaseCount,
        avgIntervalDays: c.avgPurchaseIntervalDays,
        daysSinceLastPurchase: c.daysSinceLastPurchase,
      }),
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, limit);
}

/**
 * Customers with exactly one purchase who are still in the NEW
 * window (i.e. haven't already crossed into CHURNED) — the audience
 * for "increase second purchases" campaigns.
 */
export async function getSecondPurchaseCandidates(
  limit?: number
): Promise<CustomerSummary[]> {
  const customers = await getAllCustomerSummaries();
  const candidates = customers
    .filter((c) => c.purchaseCount === 1 && c.lifecycleSegment === "NEW")
    .sort((a, b) => (a.daysSinceLastPurchase ?? 0) - (b.daysSinceLastPurchase ?? 0));
  return limit ? candidates.slice(0, limit) : candidates;
}

export async function getCustomerProfile(
  customerId: string
): Promise<CustomerProfile | null> {
  const summary = await getCustomerSummaryById(customerId);
  if (!summary) return null;

  const pool = getPool();
  const { rows } = await pool.query<{
    order_id: string;
    created_at: string;
    total_amount: string;
    product_name: string;
    quantity: number;
    price: string;
  }>(
    `select o.id as order_id, o.created_at, o.total_amount,
            p.name as product_name, oi.quantity, oi.price
     from orders o
     join order_items oi on oi.order_id = o.id
     join products p on p.id = oi.product_id
     where o.customer_id = $1 and o.status = 'paid'
     order by o.created_at asc`,
    [customerId]
  );

  const timelineByOrder = new Map<string, PurchaseTimelineEntry>();
  for (const row of rows) {
    let entry = timelineByOrder.get(row.order_id);
    if (!entry) {
      entry = {
        orderId: row.order_id,
        createdAt: row.created_at,
        totalAmount: parseFloat(row.total_amount),
        items: [],
      };
      timelineByOrder.set(row.order_id, entry);
    }
    entry.items.push({
      productName: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.price),
    });
  }

  return {
    summary,
    timeline: Array.from(timelineByOrder.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
  };
}

/** Customers who have purchased a given product at least once (paid orders only). */
export async function getCustomersByProduct(
  productName: string
): Promise<CustomerSummary[]> {
  const pool = getPool();
  const { rows } = await pool.query<{ customer_id: string }>(
    `select distinct o.customer_id
     from orders o
     join order_items oi on oi.order_id = o.id
     join products p on p.id = oi.product_id
     where o.status = 'paid' and p.name = $1`,
    [productName]
  );
  const ids = new Set(rows.map((r) => r.customer_id));
  if (ids.size === 0) return [];

  const all = await getAllCustomerSummaries();
  return all.filter((c) => ids.has(c.customerId));
}
