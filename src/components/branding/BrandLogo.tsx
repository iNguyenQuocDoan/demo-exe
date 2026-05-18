import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";
type LogoTone = "light" | "dark";

interface BrandLogoProps {
  /** sm = 28px, md = 36px, lg = 44px */
  size?: LogoSize;
  /** Hiển thị wordmark "LIFLOW" bên cạnh logo. */
  showText?: boolean;
  /** light = text trắng (dùng trên dark bg), dark = text foreground (light bg). */
  tone?: LogoTone;
  /** Suffix nhỏ sau wordmark — vd "Admin" / "Gia sư". */
  suffix?: string;
  /** Wrap trong Link với href. Truyền null để bỏ link. */
  href?: string | null;
  className?: string;
}

const SIZE_MAP: Record<
  LogoSize,
  { box: string; text: string; suffix: string }
> = {
  sm: { box: "h-7 w-7", text: "text-sm", suffix: "text-[10px]" },
  md: { box: "h-9 w-9", text: "text-base", suffix: "text-xs" },
  lg: { box: "h-11 w-11", text: "text-lg", suffix: "text-xs" },
};

/**
 * BrandLogo — wordmark có thể bật/tắt + ảnh logo dùng chung.
 * Tone "light" cần backdrop trắng vì logo PNG có nền trắng.
 */
export function BrandLogo({
  size = "md",
  showText = true,
  tone = "dark",
  suffix,
  href = "/",
  className,
}: BrandLogoProps) {
  const sz = SIZE_MAP[size];

  const inner = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl",
          sz.box,
          tone === "light"
            ? "bg-white shadow-sm ring-1 ring-white/30"
            : "bg-transparent",
        )}
      >
        <Image
          src="/logo.png"
          alt="LIFLOW"
          fill
          sizes="44px"
          className="object-contain"
          priority
        />
      </span>
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight",
            sz.text,
            tone === "light" ? "text-white" : "text-foreground",
          )}
        >
          LI
          <span className={tone === "light" ? "text-amber-300" : "text-accent"}>
            FLOW
          </span>
          {suffix && (
            <span
              className={cn(
                "ml-1.5 font-normal",
                sz.suffix,
                tone === "light" ? "text-white/60" : "text-muted-foreground",
              )}
            >
              {suffix}
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="LIFLOW — Trang chủ" className="inline-flex">
      {inner}
    </Link>
  );
}
