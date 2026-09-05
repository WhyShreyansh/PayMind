"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STAGES = ["Analyzing your customer data...", "Checking purchase history..."];

export function AssistantLoading() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setStage(1), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex gap-3 justify-start">
      <div className="h-7 w-7 rounded-full bg-brand text-white flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="h-3.5 w-3.5 animate-pulse" strokeWidth={1.75} />
      </div>
      <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-ink-soft">
        {STAGES[stage]}
      </div>
    </div>
  );
}
