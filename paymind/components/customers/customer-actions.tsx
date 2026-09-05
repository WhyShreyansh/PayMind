import { LinkButton } from "@/components/ui/button";
import type { CustomerSummary } from "@/lib/intelligence";

export function CustomerActions({ customer }: { customer: CustomerSummary }) {
  return (
    <div className="flex flex-wrap gap-2">
      <LinkButton href="#purchase-journey" variant="secondary" size="sm">
        View purchase history
      </LinkButton>
      <LinkButton href={`/customers?status=${customer.lifecycleSegment}`} variant="secondary" size="sm">
        View similar customers
      </LinkButton>
      <LinkButton href="/recommendations" variant="secondary" size="sm">
        Find recommended product
      </LinkButton>
    </div>
  );
}
