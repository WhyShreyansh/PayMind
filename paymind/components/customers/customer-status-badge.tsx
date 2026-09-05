import { Badge } from "@/components/ui/badge";
import type { ExtendedLifecycleSegment } from "@/lib/intelligence";

const LABELS: Record<ExtendedLifecycleSegment, string> = {
  NEW: "New",
  SECOND_PURCHASE: "Second Purchase",
  REPEAT: "Repeat",
  LOYAL: "Loyal",
  AT_RISK: "At Risk",
  CHURNED: "Churned",
  NO_PURCHASE: "No Purchase",
};

const TONES: Record<ExtendedLifecycleSegment, "neutral" | "brand" | "amber" | "red"> = {
  NEW: "brand",
  SECOND_PURCHASE: "brand",
  REPEAT: "brand",
  LOYAL: "brand",
  AT_RISK: "amber",
  CHURNED: "neutral",
  NO_PURCHASE: "neutral",
};

export function CustomerStatusBadge({ status }: { status: ExtendedLifecycleSegment }) {
  return (
    <Badge tone={TONES[status]}>
      {status === "LOYAL" ? "★ " : null}
      {LABELS[status]}
    </Badge>
  );
}
