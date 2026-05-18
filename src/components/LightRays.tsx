import { cn } from "@/lib/utils";

interface LightRaysProps {
  className?: string;
  intensity?: "soft" | "strong";
}

export default function LightRays({ className, intensity = "soft" }: LightRaysProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "light-rays pointer-events-none absolute inset-0 overflow-hidden",
        intensity === "strong" ? "light-rays--strong" : "light-rays--soft",
        className
      )}
    >
      <div className="light-rays__bands" />
      <div className="light-rays__grid" />
      <div className="light-rays__sweep" />
      <span className="light-rays__beam light-rays__beam--one" />
      <span className="light-rays__beam light-rays__beam--two" />
      <span className="light-rays__beam light-rays__beam--three" />
    </div>
  );
}
