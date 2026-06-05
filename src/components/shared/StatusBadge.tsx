import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StatusMeta } from "@/lib/statusMeta";

interface StatusBadgeProps {
  /** Registry (vd BOOKING_STATUS_META) — dùng cùng `value`. */
  registry?: Record<string, StatusMeta>;
  /** Giá trị status FE (key của registry). */
  value?: string | null;
  /** Hoặc truyền thẳng meta đã tính (vd bookingStatusMeta(status, viewer)). */
  meta?: StatusMeta;
  showIcon?: boolean;
  className?: string;
}

/**
 * Badge trạng thái dùng chung cho mọi giao diện. Fallback an toàn: nếu value không
 * có trong registry → hiển thị value gốc (variant secondary) thay vì crash.
 */
export function StatusBadge({
  registry,
  value,
  meta,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const fromRegistry = value ? registry?.[value] : undefined;
  const resolved: StatusMeta =
    meta ??
    fromRegistry ??
    ({ label: value ?? "—", variant: "secondary" } as StatusMeta);
  const Icon = resolved.icon;
  return (
    <Badge variant={resolved.variant} className={cn("gap-1", className)}>
      {showIcon && Icon ? <Icon className="h-3 w-3" /> : null}
      {resolved.label}
    </Badge>
  );
}
