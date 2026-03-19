import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  action,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn("surface-card p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <Button asChild size="sm" className="gap-2">
            <Link href={action.href}>
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
