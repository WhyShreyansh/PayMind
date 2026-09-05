"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    // router.refresh() re-runs the server component's data fetch;
    // this timeout just keeps the spin visible long enough to register.
    setTimeout(() => setRefreshing(false), 600);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-serif-display text-[26px] text-ink">
          {getGreeting()}, Founder
        </h1>
        <p className="text-ink-soft text-sm mt-1">
          Here&apos;s what&apos;s happening with GlowSkin&apos;s customers.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-faint border border-border rounded-md px-2.5 py-1.5">
          All time
        </span>
        <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
