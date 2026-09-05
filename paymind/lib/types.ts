export type OrderStatus = "created" | "paid" | "failed" | "refunded";
export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  razorpay_order_id: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface CustomerEvent {
  id: string;
  customer_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type LifecycleSegment =
  | "NEW"
  | "SECOND_PURCHASE"
  | "REPEAT"
  | "LOYAL"
  | "AT_RISK"
  | "CHURNED";
