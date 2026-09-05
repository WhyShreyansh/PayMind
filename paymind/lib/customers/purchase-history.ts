import { getPool } from "@/lib/db/pool";
import type { PurchaseHistoryEntry } from "./types";

interface Row {
  order_id: string;
  created_at: string;
  total_amount: string;
  product_name: string;
  quantity: number;
  price: string;
  payment_status: string | null;
  payment_method: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
}

/**
 * Full chronological purchase history for a customer, paid orders
 * only — never surfaces failed/cancelled orders as purchases. Each
 * entry carries order + payment detail (status, method, Razorpay
 * IDs) for the expandable order-detail view. No Razorpay secrets are
 * ever selected here, only the public order/payment identifiers.
 */
export async function getCustomerPurchaseHistory(
  customerId: string
): Promise<PurchaseHistoryEntry[]> {
  const pool = getPool();
  const { rows } = await pool.query<Row>(
    `select
       o.id as order_id, o.created_at, o.total_amount,
       p.name as product_name, oi.quantity, oi.price,
       pay.status as payment_status, pay.payment_method,
       o.razorpay_order_id, pay.razorpay_payment_id
     from orders o
     join order_items oi on oi.order_id = o.id
     join products p on p.id = oi.product_id
     left join payments pay on pay.order_id = o.id
     where o.customer_id = $1 and o.status = 'paid'
     order by o.created_at asc`,
    [customerId]
  );

  const byOrder = new Map<string, PurchaseHistoryEntry>();
  for (const row of rows) {
    let entry = byOrder.get(row.order_id);
    if (!entry) {
      entry = {
        orderId: row.order_id,
        createdAt: row.created_at,
        totalAmount: parseFloat(row.total_amount),
        items: [],
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        razorpayOrderId: row.razorpay_order_id,
        razorpayPaymentId: row.razorpay_payment_id,
      };
      byOrder.set(row.order_id, entry);
    }
    entry.items.push({
      productName: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.price),
    });
  }

  return Array.from(byOrder.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
