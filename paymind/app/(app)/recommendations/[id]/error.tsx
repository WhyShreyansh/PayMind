"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RecommendationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Recommendation detail failed to load:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-sm w-full">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-8 w-8 text-red mx-auto" strokeWidth={1.5} />
          <h2 className="text-ink font-medium mt-3">Unable to load this recommendation.</h2>
          <p className="text-sm text-ink-soft mt-1.5">Please try again.</p>
          <Button onClick={reset} size="sm" className="mt-5">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
