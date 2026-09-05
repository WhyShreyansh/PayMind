import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CustomerDetailLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16 mt-2" />
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5 h-48">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-32 w-full" />
        </Card>
        <Card className="p-5 h-48">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>

      <Card className="p-5 h-40 mb-4">
        <Skeleton className="h-4 w-40 mb-3" />
        <Skeleton className="h-20 w-full" />
      </Card>

      <Card className="p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full mb-2" />
        ))}
      </Card>
    </div>
  );
}
