import { cn } from "@/lib/utils";

interface ContainerProps {
  size?: "sm" | "default" | "lg" | "full";
  className?: string;
  children: React.ReactNode;
}

export function Container({
  size = "default",
  className,
  children,
}: ContainerProps) {
  const maxWidths = {
    sm: "max-w-screen-sm", // 960px
    default: "max-w-screen-xl", // 1440px
    lg: "max-w-[1600px]",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "site-container mx-auto w-full",
        maxWidths[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
