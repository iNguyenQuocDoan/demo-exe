import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PageHeaderCompact({
  badge,
  title,
  description,
  className,
  actions,
}: {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className={cn("surface-card p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          {badge ? (
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
              {badge}
            </Badge>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
