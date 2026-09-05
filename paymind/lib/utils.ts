import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountInRupees: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountInRupees);
}

/** Compact Indian-style currency: ₹42,800 stays as-is, ₹4,28,000 -> ₹4.28L,
 * ₹1,20,00,000 -> ₹1.2Cr. Falls back to full formatting under 1 lakh. */
export function formatCurrencyCompact(amountInRupees: number): string {
  const abs = Math.abs(amountInRupees);
  if (abs >= 1_00_00_000) {
    return `₹${(amountInRupees / 1_00_00_000).toFixed(2).replace(/\.?0+$/, "")}Cr`;
  }
  if (abs >= 1_00_000) {
    return `₹${(amountInRupees / 1_00_000).toFixed(2).replace(/\.?0+$/, "")}L`;
  }
  return formatCurrency(amountInRupees);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatPercent(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.floor(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}
