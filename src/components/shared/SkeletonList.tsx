import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
