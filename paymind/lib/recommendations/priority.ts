import type { Priority } from "./types";

/**
 * Deterministic opportunity score — not a prediction, just a simple,
 * explainable way to rank recommendations against each other:
 *
 *   score = (audienceSize / totalPurchasingCustomers)
 *         × min(avgAudienceValue / overallAvgLifetimeValue, 2)
 *
 * The first factor rewards reach (how much of the customer base this
 * touches). The second rewards targeting higher-value customers,
 * capped at 2x the store average so one outlier audience can't blow
 * the scale out. Thresholds below were calibrated against the
 * GlowSkin seed dataset's real numbers, not picked arbitrarily —
 * see README for the actual values observed.
 */
export function computePriority(
  audienceSize: number,
  avgAudienceValue: number,
  totalPurchasingCustomers: number,
  overallAvgLifetimeValue: number
): { priority: Priority; score: number; explanation: string } {
  const reach = totalPurchasingCustomers > 0 ? audienceSize / totalPurchasingCustomers : 0;
  const valueRatio =
    overallAvgLifetimeValue > 0
      ? Math.min(avgAudienceValue / overallAvgLifetimeValue, 2)
      : 1;
  const score = reach * valueRatio;

  let priority: Priority;
  if (score >= 0.12) priority = "HIGH";
  else if (score >= 0.04) priority = "MEDIUM";
  else priority = "LOW";

  const reachPct = Math.round(reach * 100);
  const explanation = `Reaches ${reachPct}% of purchasing customers at ${valueRatio.toFixed(
    1
  )}x the average customer value.`;

  return { priority, score, explanation };
}
