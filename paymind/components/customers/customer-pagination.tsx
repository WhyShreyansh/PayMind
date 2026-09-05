import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function CustomerPagination({
  page,
  totalPages,
  total,
  pageSize,
  searchParams,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}) {
  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(p));
    return `/customers?${params.toString()}`;
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-ink-soft text-xs">
        {total === 0
          ? "No results"
          : `Showing ${formatNumber(start)}–${formatNumber(end)} of ${formatNumber(total)}`}
      </span>
      <div className="flex items-center gap-1">
        <Link
          href={hrefForPage(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs ${
            page <= 1
              ? "pointer-events-none opacity-40"
              : "text-ink-soft hover:bg-border-soft hover:text-ink"
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Link>
        <span className="text-xs text-ink-faint px-2">
          Page {page} of {totalPages}
        </span>
        <Link
          href={hrefForPage(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs ${
            page >= totalPages
              ? "pointer-events-none opacity-40"
              : "text-ink-soft hover:bg-border-soft hover:text-ink"
          }`}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
