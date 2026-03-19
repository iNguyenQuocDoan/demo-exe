import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}

export function Section({
  children,
  className = "",
  containerClassName = "",
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn("section-space", className)}>
      <div className={cn("site-container", containerClassName)}>{children}</div>
    </section>
  );
}

export function Grid({
  children,
  className = "",
  cols = "default",
}: {
  children: React.ReactNode;
  className?: string;
  cols?: "default" | "2" | "3" | "4" | "6";
}) {
  const colsClass = {
    default: "grid-cols-4 md:grid-cols-6 lg:grid-cols-12",
    "2": "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    "6": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };

  return (
    <div
      className={cn("grid gap-4 sm:gap-5 lg:gap-6", colsClass[cols], className)}
    >
      {children}
    </div>
  );
}

/**
 * Max-width container for text content
 */
export function TextContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-readable mx-auto", className)}>{children}</div>
  );
}
