import type { LifecycleSegment } from "@/lib/types";

/** A customer who hasn't completed a paid order yet. Not one of the
 * six lifecycle segments — excluded from lifecycle stats and most
 * customer-facing lists, but tracked so nothing is silently dropped. */
export type ExtendedLifecycleSegment = LifecycleSegment | "NO_PURCHASE";

export interface BusinessMetrics {
  totalCustomers: number; // customers with >=1 paid order
  newCustomers: number; // lifecycle = NEW
  returningCustomers: number; // purchase_count >= 2
  oneTimeBuyers: number; // purchase_count == 1
  secondTimeBuyers: number; // purchase_count == 2
  thirdTimeBuyers: number; // purchase_count == 3
  fourPlusBuyers: number; // purchase_count >= 4
  repeatPurchaseRate: number; // returningCustomers / totalCustomers, 0 if no customers
  totalRevenue: number;
  returningCustomerRevenue: number; // all-time revenue from customers who are now "returning"
  newCustomerRevenue: number; // totalRevenue - returningCustomerRevenue
  averageOrderValue: number;
  averageCustomerLifetimeValue: number;
}

export interface LifecycleDistribution {
  segment: ExtendedLifecycleSegment;
  count: number;
  percentage: number; // of totalCustomers (purchase_count >= 1)
}

export interface CustomerSummary {
  customerId: string;
  name: string;
  email: string;
  phone: string | null;
  customerSince: string;
  purchaseCount: number;
  totalSpent: number;
  avgOrderValue: number;
  firstPurchaseDate: string | null;
  lastPurchaseDate: string | null;
  avgPurchaseIntervalDays: number | null;
  daysSinceLastPurchase: number | null;
  favoriteProduct: string | null;
  favoriteCategory: string | null;
  lifecycleSegment: ExtendedLifecycleSegment;
}

export interface AtRiskCustomer extends CustomerSummary {
  expectedCycleDays: number;
  daysOverdue: number; // daysSinceLastPurchase - expectedCycleDays
}

export interface PurchaseTimelineEntry {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  items: { productName: string; quantity: number; price: number }[];
}

export interface CustomerProfile {
  summary: CustomerSummary;
  timeline: PurchaseTimelineEntry[];
}

export interface ProductAffinity {
  product: string;
  coBuyers: number;
  conversionRate: number; // coBuyers / totalBuyers of the source product
}

export interface ProductPurchasePattern {
  product: string;
  totalBuyers: number;
  topNextProducts: ProductAffinity[];
}
