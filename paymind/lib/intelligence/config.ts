/**
 * Deterministic lifecycle segmentation thresholds.
 *
 * These are rules, not machine-learning predictions — see
 * lib/intelligence/lifecycle.ts for how they're applied, and its
 * doc comment for the full written rationale.
 */
export const INTELLIGENCE_CONFIG = {
  /** Used as a customer's "expected repurchase cycle" when we don't
   * have at least one real gap between their own orders to measure
   * (i.e. they have 0 or 1 paid orders). Based on the seed data's
   * average repeat-purchase interval for GlowSkin-style skincare. */
  DEFAULT_CYCLE_DAYS: 45,

  /** AT_RISK requires >=2 purchases AND days-since-last-purchase
   * beyond max(expectedCycle * AT_RISK_MULTIPLIER, AT_RISK_MIN_DAYS). */
  AT_RISK_MULTIPLIER: 1.5,
  AT_RISK_MIN_DAYS: 45,

  /** CHURNED applies to anyone (any purchase count) beyond
   * max(expectedCycle * CHURNED_MULTIPLIER, CHURNED_MIN_DAYS)
   * days since their last purchase. */
  CHURNED_MULTIPLIER: 3,
  CHURNED_MIN_DAYS: 120,
} as const;
