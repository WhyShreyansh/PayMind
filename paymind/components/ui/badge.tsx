import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "brand" | "amber" | "red";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-border-soft text-ink-soft",
  brand: "bg-brand-soft text-brand-strong",
  amber: "bg-amber-soft text-amber",
  red: "bg-red-soft text-red",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
