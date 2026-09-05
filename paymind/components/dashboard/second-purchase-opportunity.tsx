import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import type { CustomerSummary, ProductPurchasePattern } from "@/lib/intelligence";

export function SecondPurchaseOpportunity({
  candidates,
  topAffinity,
}: {
  candidates: CustomerSummary[];
  topAffinity: ProductPurchasePattern | null;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center gap-2 text-ink">
          <Target className="h-4 w-4 text-brand" strokeWidth={1.75} />
          <span className="text-[15px] font-medium">Second Purchase Opportunity</span>
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-ink-soft mt-3">
            No customers currently qualify — check back as new first purchases come in.
          </p>
        ) : (
          <>
            <div className="font-serif-display text-3xl text-ink mt-3">
              {formatNumber(candidates.length)} customers
            </div>
            <p className="text-sm text-ink-soft mt-1">
              Made a first purchase recently and haven&apos;t returned — good candidates
              for a second-purchase push.
            </p>
            {topAffinity && (
              <p className="text-xs text-ink-faint mt-2">
                Best-fit product: {topAffinity.topNextProducts[0]?.product ?? topAffinity.product}
              </p>
            )}
            <LinkButton href="/recommendations" size="sm" className="mt-4">
              View Opportunities
            </LinkButton>
          </>
        )}
      </CardContent>
    </Card>
  );
}
