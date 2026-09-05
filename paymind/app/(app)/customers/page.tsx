import { listCustomers, getCustomerListSummary } from "@/lib/customers";
import type {
  CustomerSortField,
  SortDirection,
  PurchaseCountFilter,
} from "@/lib/customers";
import type { ExtendedLifecycleSegment } from "@/lib/intelligence";
import { CustomerHeader } from "@/components/customers/customer-header";
import { CustomerSummaryCards } from "@/components/customers/customer-summary";
import { CustomerFilters } from "@/components/customers/customer-filters";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerPagination } from "@/components/customers/customer-pagination";

export const dynamic = "force-dynamic";

const VALID_STATUSES: ExtendedLifecycleSegment[] = [
  "NEW",
  "SECOND_PURCHASE",
  "REPEAT",
  "LOYAL",
  "AT_RISK",
  "CHURNED",
];
const VALID_PURCHASE_COUNTS: PurchaseCountFilter[] = ["1", "2", "3", "4+"];
const VALID_SORT_FIELDS: CustomerSortField[] = ["totalSpent", "purchaseCount", "lastPurchaseDate"];

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const search = sp.search;
  const status = VALID_STATUSES.includes(sp.status as ExtendedLifecycleSegment)
    ? (sp.status as ExtendedLifecycleSegment)
    : undefined;
  const purchaseCount = VALID_PURCHASE_COUNTS.includes(sp.purchaseCount as PurchaseCountFilter)
    ? (sp.purchaseCount as PurchaseCountFilter)
    : undefined;
  const sortBy = VALID_SORT_FIELDS.includes(sp.sortBy as CustomerSortField)
    ? (sp.sortBy as CustomerSortField)
    : "totalSpent";
  const sortDir: SortDirection = sp.sortDir === "asc" ? "asc" : "desc";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [summary, result] = await Promise.all([
    getCustomerListSummary(),
    listCustomers({ search, status, purchaseCount, sortBy, sortDir, page, pageSize: 25 }),
  ]);

  return (
    <div>
      <CustomerHeader />
      <CustomerSummaryCards summary={summary} />
      <CustomerFilters
        status={status ?? ""}
        purchaseCount={purchaseCount ?? ""}
        sortBy={sortBy}
        sortDir={sortDir}
      />
      <CustomerTable customers={result.customers} />
      <CustomerPagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
        searchParams={{ search, status, purchaseCount, sortBy, sortDir }}
      />
    </div>
  );
}
