import type { CustomerSummary, ExtendedLifecycleSegment } from "@/lib/intelligence";

export type CustomerSortField = "totalSpent" | "purchaseCount" | "lastPurchaseDate";
export type SortDirection = "asc" | "desc";
export type PurchaseCountFilter = "1" | "2" | "3" | "4+";

export interface CustomerListParams {
  search?: string;
  status?: ExtendedLifecycleSegment;
  purchaseCount?: PurchaseCountFilter;
  sortBy?: CustomerSortField;
  sortDir?: SortDirection;
  page?: number; // 1-based
  pageSize?: number;
}

export interface CustomerListResult {
  customers: CustomerSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerListSummary {
  totalCustomers: number;
  returningCustomers: number;
  atRiskCustomers: number;
  loyalCustomers: number;
}

export interface OrderDetailItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface PurchaseHistoryEntry {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  items: OrderDetailItem[];
  paymentStatus: string | null;
  paymentMethod: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
}

export interface ProductHistoryEntry {
  productId: string;
  productName: string;
  category: string;
  orderCount: number; // number of distinct orders containing this product
  totalQuantity: number;
  totalSpent: number;
  lastPurchasedAt: string;
}

export interface CustomerMemory {
  summary: string; // deterministic natural-language paragraph
  facts: { label: string; value: string }[];
}

export type OpportunityKind =
  | "SECOND_PURCHASE"
  | "REACTIVATION"
  | "LOYAL"
  | "NONE";

export interface CustomerOpportunity {
  kind: OpportunityKind;
  label: string; // e.g. "Potential second purchase"
  description: string;
  recommendedProduct: string | null;
}

export interface CustomerDetail {
  summary: CustomerSummary;
  purchaseHistory: PurchaseHistoryEntry[];
  productHistory: ProductHistoryEntry[];
  memory: CustomerMemory;
  opportunity: CustomerOpportunity;
}
