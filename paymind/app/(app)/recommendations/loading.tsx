import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function RecommendationsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-64 mb-2" />
      <Skeleton className="h-4 w-80 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-4 w-full mt-3" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-36" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
