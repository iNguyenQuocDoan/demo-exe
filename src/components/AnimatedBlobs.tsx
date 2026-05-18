"use client";

interface Blob {
  /** Vị trí top % */
  top: string;
  /** Vị trí left % */
  left: string;
  /** Đường kính px */
  size: number;
  /** Màu (chấp nhận oklch / rgba — alpha thấp ~0.15-0.3) */
  color: string;
  /** Delay (s) lệch pha animation */
  delay?: number;
  /** Chu kỳ animation (s) */
  duration?: number;
}

interface AnimatedBlobsProps {
  blobs?: Blob[];
  /** Class thêm cho wrapper */
  className?: string;
}

/**
 * Slow-drifting radial gradient blobs làm section background.
 * Pure CSS animation, override `tw-animate-css` reduced-motion nuke via !important.
 * Đặt vào parent có `position: relative; overflow: hidden`.
 */
const KEYFRAMES = `
@keyframes blob-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  33%      { transform: translate3d(60px, -40px, 0) scale(1.08); }
  66%      { transform: translate3d(-30px, 50px, 0) scale(0.94); }
}
@keyframes blob-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  40%      { transform: translate3d(-70px, 30px, 0) scale(1.05); }
  75%      { transform: translate3d(40px, -50px, 0) scale(0.96); }
}
@keyframes blob-pulse {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 1; }
}
.animated-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  will-change: transform, opacity;
}
`;

const DEFAULT_BLOBS: Blob[] = [
  { top: "8%",  left: "6%",  size: 380, color: "oklch(0.78 0.16 245 / 0.18)", duration: 18 },
  { top: "55%", left: "78%", size: 460, color: "oklch(0.82 0.14 70 / 0.16)",  duration: 22, delay: 4 },
  { top: "70%", left: "12%", size: 320, color: "oklch(0.72 0.18 290 / 0.14)", duration: 26, delay: 8 },
];

export default function AnimatedBlobs({
  blobs = DEFAULT_BLOBS,
  className = "",
}: AnimatedBlobsProps) {
  // Inject per-instance animation rules with !important so they survive
  // tw-animate-css's reduced-motion override (`* { animation-duration: 0.01ms !important }`).
  const animRules = blobs
    .map((b, i) => {
      const driftName = i % 2 === 0 ? "blob-drift-a" : "blob-drift-b";
      const dur = b.duration ?? 20;
      const delay = b.delay ?? 0;
      return `.animated-blob[data-idx="${i}"] {
        animation: ${driftName} ${dur}s ease-in-out ${delay}s infinite,
                   blob-pulse ${dur * 0.6}s ease-in-out ${delay}s infinite !important;
      }`;
    })
    .join("\n");

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES + animRules }} />
      {blobs.map((b, i) => (
        <div
          key={i}
          data-idx={i}
          className="animated-blob"
          style={{
            top: b.top,
            left: b.left,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: `radial-gradient(circle at center, ${b.color} 0%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
}
