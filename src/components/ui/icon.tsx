import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icon system dùng chung.
 *
 * Toàn bộ FE dùng một thư viện duy nhất: lucide-react (stroke, mặc định
 * strokeWidth=2). Không trộn outline/solid/duotone/emoji/SVG thủ công.
 *
 * Ba component ở đây kiểm soát size, màu, và trạng thái trang trí. Mục đích là
 * để icon là một phần của hệ thống giao diện chứ không phải vật trang trí thêm
 * vào cho đẹp — dùng chúng thay vì tự viết `<Icon className="h-... w-..." />`.
 */

/** Thang kích thước icon. Không thêm bậc mới nếu chưa thật sự cần. */
export const ICON_SIZE = {
  /** 14px — status icon, chú thích phụ */
  xs: "h-3.5 w-3.5",
  /** 16px — icon trong input, button nhỏ */
  sm: "h-4 w-4",
  /** 18px — button tiêu chuẩn, icon cạnh label/heading */
  md: "h-4.5 w-4.5",
  /** 20px — navigation item, button lớn */
  lg: "h-5 w-5",
  /** 22px — navigation nổi bật, heading lớn */
  xl: "h-5.5 w-5.5",
  /** 32px — CHỈ dùng cho empty state / onboarding. Không dùng trong feature card. */
  empty: "h-8 w-8",
} as const;

export type IconSize = keyof typeof ICON_SIZE;

/** Màu icon theo ngữ nghĩa. Mặc định kế thừa currentColor từ phần tử cha. */
export const ICON_TONE = {
  /** Kế thừa màu của phần tử chứa nó — dùng cho icon trong button/link */
  inherit: "",
  /** Icon phụ trợ cạnh text thường */
  muted: "text-muted-foreground",
  /** Icon mang màu thương hiệu */
  brand: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
} as const;

export type IconTone = keyof typeof ICON_TONE;

type AppIconProps = {
  icon: LucideIcon;
  size?: IconSize;
  tone?: IconTone;
  className?: string;
  /**
   * Nhãn cho screen reader. Bỏ trống = icon trang trí → tự gắn aria-hidden.
   * Chỉ đặt label khi icon là cách DUY NHẤT truyền tải thông tin; nếu cạnh icon
   * đã có text mô tả thì để trống cho screen reader bỏ qua.
   */
  label?: string;
};

/**
 * Icon chuẩn hoá. Mặc định là trang trí (aria-hidden) vì phần lớn icon trong app
 * đều đứng cạnh text đã mô tả đủ nghĩa.
 */
export function AppIcon({
  icon: Icon,
  size = "sm",
  tone = "inherit",
  className,
  label,
}: AppIconProps) {
  return (
    <Icon
      className={cn(ICON_SIZE[size], ICON_TONE[tone], "shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}

type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  icon: LucideIcon;
  /** BẮT BUỘC — button chỉ có icon phải đọc được bằng screen reader. */
  label: string;
  size?: IconSize;
  tone?: IconTone;
};

/**
 * Button chỉ có icon. `label` là bắt buộc ở mức type: vừa làm aria-label vừa làm
 * tooltip, nên không thể quên như khi viết tay `<button><X /></button>`.
 */
export function IconButton({
  icon,
  label,
  size = "sm",
  tone = "inherit",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <AppIcon icon={icon} size={size} tone={tone} />
    </button>
  );
}

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-primary",
  neutral: "text-muted-foreground",
};

/**
 * Icon trạng thái. Luôn đi kèm `label` hiển thị được — icon không bao giờ là
 * cách duy nhất truyền tải trạng thái (yêu cầu accessibility).
 */
export function StatusIcon({
  icon: Icon,
  tone,
  label,
  size = "xs",
  className,
}: {
  icon: LucideIcon;
  tone: StatusTone;
  /** Text trạng thái hiển thị cạnh icon. */
  label: string;
  size?: IconSize;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", STATUS_TONE_CLASS[tone], className)}>
      <Icon className={cn(ICON_SIZE[size], "shrink-0")} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
