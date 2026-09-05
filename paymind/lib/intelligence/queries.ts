import { getPool } from "@/lib/db/pool";
import { computeLifecycleSegment } from "./lifecycle";
import type { CustomerSummary } from "./types";

interface RawCustomerIntelligenceRow {
  customer_id: string;
  name: string;
  email: string;
  phone: string | null;
  customer_since: string;
  purchase_count: string | number;
  total_spent: string | number;
  avg_order_value: string | number;
  first_purchase_date: string | null;
  last_purchase_date: string | null;
  avg_interval_days: string | number | null;
  days_since_last_purchase: number | null;
  favorite_product_name: string | null;
  favorite_category: string | null;
}

function toNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === "number" ? v : parseFloat(v);
}

function mapRow(row: RawCustomerIntelligenceRow): CustomerSummary {
  const purchaseCount = toNumber(row.purchase_count);
  const avgIntervalDays =
    row.avg_interval_days === null ? null : toNumber(row.avg_interval_days);
  const daysSinceLastPurchase = row.days_since_last_purchase;

  return {
    customerId: row.customer_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    customerSince: row.customer_since,
    purchaseCount,
    totalSpent: toNumber(row.total_spent),
    avgOrderValue: toNumber(row.avg_order_value),
    firstPurchaseDate: row.first_purchase_date,
    lastPurchaseDate: row.last_purchase_date,
    avgPurchaseIntervalDays: avgIntervalDays,
    daysSinceLastPurchase,
    favoriteProduct: row.favorite_product_name,
    favoriteCategory: row.favorite_category,
    lifecycleSegment: computeLifecycleSegment({
      purchaseCount,
      avgIntervalDays,
      daysSinceLastPurchase,
    }),
  };
}

/**
 * Fetches every customer's intelligence row in a single query and
 * computes their lifecycle segment in application code. At MVP data
 * volumes (thousands, not millions, of customers) this is simpler
 * and just as fast as pushing the segmentation logic into SQL, and
 * it keeps the lifecycle rules in one testable, documented place.
 */
export async function getAllCustomerSummaries(): Promise<CustomerSummary[]> {
  const pool = getPool();
  const { rows } = await pool.query<RawCustomerIntelligenceRow>(
    `select
       customer_id, name, email, phone, customer_since, purchase_count, total_spent, avg_order_value,
       first_purchase_date, last_purchase_date, avg_interval_days,
       days_since_last_purchase, favorite_product_name, favorite_category
     from customer_intelligence`
  );
  return rows.map(mapRow);
}

export async function getCustomerSummaryById(
  customerId: string
): Promise<CustomerSummary | null> {
  const pool = getPool();
  const { rows } = await pool.query<RawCustomerIntelligenceRow>(
    `select
       customer_id, name, email, phone, customer_since, purchase_count, total_spent, avg_order_value,
       first_purchase_date, last_purchase_date, avg_interval_days,
       days_since_last_purchase, favorite_product_name, favorite_category
     from customer_intelligence
     where customer_id = $1`,
    [customerId]
  );
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}
