import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonGrid({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="surface-card overflow-hidden">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
            </div>
            <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
