import type { CustomerSummary } from "@/lib/intelligence";

export type RecommendationType =
  | "SECOND_PURCHASE"
  | "AT_RISK"
  | "CROSS_SELL"
  | "CHURNED_REACTIVATION"
  | "LOYAL_ENGAGEMENT";

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface OfferSuggestion {
  type: "PERCENTAGE" | "EXCLUSIVE";
  value?: number; // percentage points, when type is PERCENTAGE
  label: string; // human-readable, e.g. "10% off Serum"
}

export interface RecommendedProduct {
  name: string;
  reason: string; // e.g. "Customers who bought Face Wash frequently buy Serum next."
}

export interface RecommendationMetrics {
  totalValue: number; // sum of totalSpent across the audience
  avgSpend: number;
  avgDaysSinceLastPurchase: number | null;
  [key: string]: number | string | null;
}

export interface Recommendation {
  id: string; // stable slug, e.g. "second-purchase", "cross-sell-face-wash-serum"
  type: RecommendationType;
  title: string;
  priority: Priority;
  priorityExplanation: string;
  audienceSize: number;
  reason: string; // WHY this audience
  recommendedProduct: RecommendedProduct | null; // WHAT to sell
  suggestedOffer: OfferSuggestion; // OFFER
  exploreHref: string; // WHERE to inspect them (Phase 4 Customer Explorer)
  metrics: RecommendationMetrics;
  /** A small sample for cards/detail pages — never the full audience. */
  customers: CustomerSummary[];
}
