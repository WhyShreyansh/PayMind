import { getPool } from "@/lib/db/pool";
import type { ProductPurchasePattern } from "./types";

interface OrderProductRow {
  customer_id: string;
  product_name: string;
  created_at: string;
}

/**
 * Deterministic (no ML) product affinity: for each product, "which
 * product did customers who bought this one purchase next, most
 * often" — based on each customer's actual chronological purchase
 * sequence, not just co-occurrence. This is what powers cross-sell
 * insights like "Face Wash customers frequently purchase Serum next"
 * and, later, the Phase 6 recommendation engine.
 */
export async function getProductPurchasePatterns(
  minBuyers = 20
): Promise<ProductPurchasePattern[]> {
  const pool = getPool();
  const { rows } = await pool.query<OrderProductRow>(
    `select o.customer_id, p.name as product_name, o.created_at
     from orders o
     join order_items oi on oi.order_id = o.id
     join products p on p.id = oi.product_id
     where o.status = 'paid'
     order by o.customer_id, o.created_at asc`
  );

  // Group into each customer's distinct, chronologically-ordered product sequence.
  const sequenceByCustomer = new Map<string, string[]>();
  for (const row of rows) {
    const seq = sequenceByCustomer.get(row.customer_id) ?? [];
    if (seq[seq.length - 1] !== row.product_name) {
      // Collapse consecutive repeats of the same product (e.g. reordering
      // Sunscreen twice in a row isn't a "next product" signal).
      seq.push(row.product_name);
    }
    sequenceByCustomer.set(row.customer_id, seq);
  }

  const totalBuyers = new Map<string, number>();
  const nextProductCounts = new Map<string, Map<string, number>>();

  for (const seq of sequenceByCustomer.values()) {
    const seenProducts = new Set(seq);
    for (const product of seenProducts) {
      totalBuyers.set(product, (totalBuyers.get(product) ?? 0) + 1);
    }
    for (let i = 0; i < seq.length - 1; i++) {
      const from = seq[i];
      const to = seq[i + 1];
      if (from === to) continue;
      if (!nextProductCounts.has(from)) nextProductCounts.set(from, new Map());
      const inner = nextProductCounts.get(from)!;
      inner.set(to, (inner.get(to) ?? 0) + 1);
    }
  }

  const patterns: ProductPurchasePattern[] = [];
  for (const [product, buyers] of totalBuyers.entries()) {
    if (buyers < minBuyers) continue;
    const nextCounts = nextProductCounts.get(product) ?? new Map();
    const topNextProducts = Array.from(nextCounts.entries())
      .map(([next, coBuyers]) => ({
        product: next,
        coBuyers,
        conversionRate: coBuyers / buyers,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 3);

    patterns.push({ product, totalBuyers: buyers, topNextProducts });
  }

  return patterns.sort((a, b) => b.totalBuyers - a.totalBuyers);
}
