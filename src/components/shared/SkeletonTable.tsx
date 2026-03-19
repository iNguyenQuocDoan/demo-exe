import { Skeleton } from "@/components/ui/skeleton";

/**
 * SkeletonTable — table-shaped loading skeleton.
 * Use in pages that render a <table> or a row-list (admin lists, booking tables).
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="surface-card overflow-hidden">
      {/* Header row */}
      <div
        className="grid gap-4 border-b border-border bg-muted/40 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-24 rounded" />
        ))}
      </div>

      {/* Data rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid items-center gap-4 px-4 py-4"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }).map((_, col) => (
              <Skeleton
                key={col}
                className={`h-4 rounded ${col === 0 ? "w-3/4" : col === cols - 1 ? "w-16" : "w-1/2"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
