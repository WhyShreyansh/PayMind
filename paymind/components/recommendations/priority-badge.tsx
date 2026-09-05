import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/recommendations/types";

const TONE: Record<Priority, "brand" | "amber" | "neutral"> = {
  HIGH: "brand",
  MEDIUM: "amber",
  LOW: "neutral",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={TONE[priority]}>{priority}</Badge>;
}
