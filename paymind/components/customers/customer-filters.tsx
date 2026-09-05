"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "NEW", label: "New" },
  { value: "SECOND_PURCHASE", label: "Second Purchase" },
  { value: "REPEAT", label: "Repeat" },
  { value: "LOYAL", label: "Loyal" },
  { value: "AT_RISK", label: "At Risk" },
  { value: "CHURNED", label: "Churned" },
];

const PURCHASE_COUNT_OPTIONS = [
  { value: "", label: "Any purchase count" },
  { value: "1", label: "1 purchase" },
  { value: "2", label: "2 purchases" },
  { value: "3", label: "3 purchases" },
  { value: "4+", label: "4+ purchases" },
];

const SORT_OPTIONS = [
  { value: "totalSpent-desc", label: "Lifetime value (high to low)" },
  { value: "totalSpent-asc", label: "Lifetime value (low to high)" },
  { value: "purchaseCount-desc", label: "Purchases (most first)" },
  { value: "purchaseCount-asc", label: "Purchases (fewest first)" },
  { value: "lastPurchaseDate-desc", label: "Last purchase (recent first)" },
  { value: "lastPurchaseDate-asc", label: "Last purchase (oldest first)" },
];

export function CustomerFilters({
  status,
  purchaseCount,
  sortBy,
  sortDir,
}: {
  status: string;
  purchaseCount: string;
  sortBy: string;
  sortDir: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateSort(combined: string) {
    const [field, dir] = combined.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", field);
    params.set("sortDir", dir);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Select
        aria-label="Filter by lifecycle status"
        value={status}
        onChange={(e) => updateParam("status", e.target.value)}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by purchase count"
        value={purchaseCount}
        onChange={(e) => updateParam("purchaseCount", e.target.value)}
      >
        {PURCHASE_COUNT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Sort customers"
        value={`${sortBy}-${sortDir}`}
        onChange={(e) => updateSort(e.target.value)}
        className="ml-auto"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
