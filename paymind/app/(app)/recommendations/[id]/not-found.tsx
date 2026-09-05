import { SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default function RecommendationNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-sm w-full">
        <CardContent className="py-8 text-center">
          <SearchX className="h-8 w-8 text-ink-faint mx-auto" strokeWidth={1.5} />
          <h2 className="text-ink font-medium mt-3">Recommendation not found</h2>
          <p className="text-sm text-ink-soft mt-1.5">
            This recommendation may no longer be active based on your current customer data.
          </p>
          <LinkButton href="/recommendations" size="sm" className="mt-5">
            Back to Recommendations
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
