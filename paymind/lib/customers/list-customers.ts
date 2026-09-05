import { getAllCustomerSummaries } from "@/lib/intelligence";
import type { CustomerListParams, CustomerListResult, CustomerListSummary } from "./types";

const DEFAULT_PAGE_SIZE = 25;

/**
 * Search + filter + sort + paginate customers for the /customers table.
 *
 * Architecture note: lifecycle status (AT_RISK, CHURNED, etc.) is
 * computed in application code, not SQL (see lib/intelligence/lifecycle.ts —
 * kept there deliberately so the rules live in one documented,
 * testable place). That means status-based filtering can't be pushed
 * down as a SQL WHERE clause without duplicating those rules in SQL.
 *
 * The tradeoff this function makes: it fetches every customer's
 * summary row from Postgres in one query (cheap at MVP scale — a
 * few thousand rows, sub-10ms), computes lifecycle segments,
 * filters/sorts/paginates all of that in Node, and returns only the
 * current page to the caller. The browser never receives more than
 * `pageSize` customers — the "don't ship every customer to the
 * client" requirement is about what crosses into the rendered page,
 * not about avoiding a single cheap server-side query. If this
 * dataset grew into the hundreds of thousands of customers, the
 * right fix would be a materialized `lifecycle_segment` column
 * refreshed on write, so status filtering could move into SQL too.
 */
export async function listCustomers(
  params: CustomerListParams = {}
): Promise<CustomerListResult> {
  const {
    search,
    status,
    purchaseCount,
    sortBy = "totalSpent",
    sortDir = "desc",
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params;

  const all = await getAllCustomerSummaries();
  let filtered = all.filter((c) => c.purchaseCount > 0);

  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q)
    );
  }

  if (status) {
    filtered = filtered.filter((c) => c.lifecycleSegment === status);
  }

  if (purchaseCount) {
    filtered = filtered.filter((c) =>
      purchaseCount === "4+" ? c.purchaseCount >= 4 : c.purchaseCount === Number(purchaseCount)
    );
  }

  const dir = sortDir === "asc" ? 1 : -1;
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "purchaseCount":
        return (a.purchaseCount - b.purchaseCount) * dir;
      case "lastPurchaseDate": {
        const at = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
        const bt = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
        return (at - bt) * dir;
      }
      case "totalSpent":
      default:
        return (a.totalSpent - b.totalSpent) * dir;
    }
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return {
    customers: pageItems,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

/** Summary counts for the page header — same source data as the table,
 * computed before pagination so the numbers reflect the whole dataset. */
export async function getCustomerListSummary(): Promise<CustomerListSummary> {
  const all = await getAllCustomerSummaries();
  const purchasers = all.filter((c) => c.purchaseCount > 0);
  return {
    totalCustomers: purchasers.length,
    returningCustomers: purchasers.filter((c) => c.purchaseCount >= 2).length,
    atRiskCustomers: purchasers.filter((c) => c.lifecycleSegment === "AT_RISK").length,
    loyalCustomers: purchasers.filter((c) => c.lifecycleSegment === "LOYAL").length,
  };
}
