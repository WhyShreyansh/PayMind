import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function RecommendationDetailLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="flex justify-between mb-6">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16 mt-2" />
          </Card>
        ))}
      </div>
      <Card className="p-5 mb-4">
        <Skeleton className="h-4 w-48 mb-3" />
        <Skeleton className="h-16 w-full" />
      </Card>
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5 h-32">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-10 w-full" />
        </Card>
        <Card className="p-5 h-32">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
      <Card className="p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full mb-2" />
        ))}
      </Card>
    </div>
  );
}
