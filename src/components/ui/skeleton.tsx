import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-[hsl(210_40%_92%)]", className)}
      {...props}
    />
  );
}

export { Skeleton };
