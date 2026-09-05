import type { OfferSuggestion, RecommendationType } from "./types";

/**
 * Deterministic offer suggestions per recommendation type. These are
 * NOT a pricing-optimization model — just safe, explainable defaults
 * that give the merchant a reasonable starting point. Change the
 * numbers here; nothing else in the app needs to know about it.
 */
export function getOfferForType(
  type: RecommendationType,
  productName: string | null
): OfferSuggestion {
  switch (type) {
    case "SECOND_PURCHASE":
      return {
        type: "PERCENTAGE",
        value: 10,
        label: productName ? `10% off ${productName}` : "10% off their next purchase",
      };
    case "AT_RISK":
      return {
        type: "PERCENTAGE",
        value: 15,
        label: productName ? `15% off ${productName}` : "15% off to bring them back",
      };
    case "CHURNED_REACTIVATION":
      return {
        type: "PERCENTAGE",
        value: 20,
        label: productName ? `20% off ${productName}` : "20% win-back offer",
      };
    case "LOYAL_ENGAGEMENT":
      return {
        type: "EXCLUSIVE",
        label: "Exclusive early access or a 10% loyalty reward",
      };
    case "CROSS_SELL":
      return {
        type: "PERCENTAGE",
        value: 10,
        label: productName ? `10% off ${productName}` : "10% off the recommended product",
      };
    default:
      return { type: "PERCENTAGE", value: 10, label: "10% off" };
  }
}
