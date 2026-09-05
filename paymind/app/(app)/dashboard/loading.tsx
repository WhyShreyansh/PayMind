import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20 mt-2" />
            <Skeleton className="h-3 w-28 mt-2" />
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5 h-72">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-48 w-full mt-4" />
        </Card>
        <Card className="p-5 h-72">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-48 w-full mt-4" />
        </Card>
      </div>

      <Card className="p-5 mb-4">
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5 h-48">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full mt-3" />
          </Card>
        ))}
      </div>
    </div>
  );
}
