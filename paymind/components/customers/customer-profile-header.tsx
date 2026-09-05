import Link from "next/link";
import { ChevronLeft, Mail, Phone } from "lucide-react";
import { CustomerStatusBadge } from "./customer-status-badge";
import { formatDate } from "@/lib/utils";
import type { CustomerSummary } from "@/lib/intelligence";

export function CustomerProfileHeader({ customer }: { customer: CustomerSummary }) {
  return (
    <div className="mb-6">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink mb-4"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All customers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-display text-2xl text-ink">{customer.name}</h1>
            <CustomerStatusBadge status={customer.lifecycleSegment} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
              {customer.email}
            </span>
            {customer.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                {customer.phone}
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-xs text-ink-faint">
          Customer since
          <div className="text-sm text-ink-soft">
            {formatDate(customer.customerSince)}
          </div>
        </div>
      </div>
    </div>
  );
}
