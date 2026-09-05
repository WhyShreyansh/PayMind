import { getPool } from "@/lib/db/pool";
import type { ProductHistoryEntry } from "./types";

interface Row {
  product_id: string;
  product_name: string;
  category: string;
  order_count: string;
  total_quantity: string;
  total_spent: string;
  last_purchased_at: string;
}

/** Which products a customer has purchased, and how much of each —
 * paid orders only. Powers the "Products Purchased" section. */
export async function getCustomerProductHistory(
  customerId: string
): Promise<ProductHistoryEntry[]> {
  const pool = getPool();
  const { rows } = await pool.query<Row>(
    `select
       p.id as product_id,
       p.name as product_name,
       p.category,
       count(distinct o.id) as order_count,
       sum(oi.quantity) as total_quantity,
       sum(oi.quantity * oi.price) as total_spent,
       max(o.created_at) as last_purchased_at
     from orders o
     join order_items oi on oi.order_id = o.id
     join products p on p.id = oi.product_id
     where o.customer_id = $1 and o.status = 'paid'
     group by p.id, p.name, p.category
     order by total_spent desc`,
    [customerId]
  );

  return rows.map((row) => ({
    productId: row.product_id,
    productName: row.product_name,
    category: row.category,
    orderCount: parseInt(row.order_count, 10),
    totalQuantity: parseInt(row.total_quantity, 10),
    totalSpent: parseFloat(row.total_spent),
    lastPurchasedAt: row.last_purchased_at,
  }));
}
