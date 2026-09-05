"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customer profile failed to load:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-sm w-full">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-8 w-8 text-red mx-auto" strokeWidth={1.5} />
          <h2 className="text-ink font-medium mt-3">Unable to load customer information.</h2>
          <p className="text-sm text-ink-soft mt-1.5">
            Something went wrong while fetching this customer&apos;s profile.
          </p>
          <Button onClick={reset} size="sm" className="mt-5">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
