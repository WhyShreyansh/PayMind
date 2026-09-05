import { INTELLIGENCE_CONFIG } from "./config";
import type { ExtendedLifecycleSegment } from "./types";

export interface LifecycleInput {
  purchaseCount: number;
  /** Average gap in days between this customer's own consecutive
   * paid orders. Null if they have fewer than 2 paid orders. */
  avgIntervalDays: number | null;
  /** Days since their most recent paid order. Null if they have
   * never completed a paid order. */
  daysSinceLastPurchase: number | null;
}

/**
 * Deterministic customer lifecycle rules — no ML, fully documented,
 * evaluated top-to-bottom (first match wins) so every customer lands
 * in exactly one bucket:
 *
 * 1. NO_PURCHASE  — zero paid orders. Excluded from lifecycle stats.
 * 2. CHURNED       — days since last purchase exceeds
 *                     max(expectedCycle * 3, 120 days), regardless
 *                     of purchase count. "Not purchased for a long
 *                     period" per the product spec.
 * 3. AT_RISK       — purchase count >= 2 AND days since last purchase
 *                     exceeds max(expectedCycle * 1.5, 45 days), i.e.
 *                     "previously purchased multiple times but
 *                     significantly beyond their normal interval."
 * 4. LOYAL         — purchase count >= 4.
 * 5. REPEAT        — purchase count == 3.
 * 6. SECOND_PURCHASE — purchase count == 2.
 * 7. NEW           — purchase count == 1 (and not yet churned).
 *
 * `expectedCycle` is the customer's own avg_interval_days when we
 * have it (2+ paid orders); otherwise it falls back to
 * INTELLIGENCE_CONFIG.DEFAULT_CYCLE_DAYS.
 */
export function computeLifecycleSegment(
  input: LifecycleInput
): ExtendedLifecycleSegment {
  const { purchaseCount, avgIntervalDays, daysSinceLastPurchase } = input;

  if (purchaseCount <= 0 || daysSinceLastPurchase === null) {
    return "NO_PURCHASE";
  }

  const expectedCycle = avgIntervalDays ?? INTELLIGENCE_CONFIG.DEFAULT_CYCLE_DAYS;

  const churnThreshold = Math.max(
    expectedCycle * INTELLIGENCE_CONFIG.CHURNED_MULTIPLIER,
    INTELLIGENCE_CONFIG.CHURNED_MIN_DAYS
  );
  if (daysSinceLastPurchase > churnThreshold) {
    return "CHURNED";
  }

  if (purchaseCount >= 2) {
    const atRiskThreshold = Math.max(
      expectedCycle * INTELLIGENCE_CONFIG.AT_RISK_MULTIPLIER,
      INTELLIGENCE_CONFIG.AT_RISK_MIN_DAYS
    );
    if (daysSinceLastPurchase > atRiskThreshold) {
      return "AT_RISK";
    }
  }

  if (purchaseCount >= 4) return "LOYAL";
  if (purchaseCount === 3) return "REPEAT";
  if (purchaseCount === 2) return "SECOND_PURCHASE";
  return "NEW";
}

/** How many days overdue a customer is, relative to their own
 * expected repurchase cycle. Only meaningful for AT_RISK/CHURNED. */
export function daysOverdue(input: LifecycleInput): number {
  const expectedCycle = input.avgIntervalDays ?? INTELLIGENCE_CONFIG.DEFAULT_CYCLE_DAYS;
  const days = input.daysSinceLastPurchase ?? 0;
  return Math.max(0, Math.round(days - expectedCycle));
}
