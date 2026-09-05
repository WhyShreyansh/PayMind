import { Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerMemory as CustomerMemoryType } from "@/lib/customers";

export function CustomerMemory({ memory }: { memory: CustomerMemoryType }) {
  return (
    <Card className="bg-brand text-white border-brand-strong">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-4 w-4" strokeWidth={1.75} />
          Customer Memory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white/90 leading-relaxed">{memory.summary}</p>

        {memory.facts.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/15">
            <div className="text-xs text-white/60 mb-2.5">Customer Facts</div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {memory.facts.map((f) => (
                <div key={f.label} className="flex items-center justify-between">
                  <dt className="text-white/60">{f.label}</dt>
                  <dd className="text-white">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
