"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import SpotlightCard from "@/components/SpotlightCard";

interface SubjectCardItem {
  id: string;
  label: string;
  count: string;
  image: string;
}

interface SubjectsCarouselProps {
  subjects: SubjectCardItem[];
  /** Tổng thời gian 1 vòng marquee (đi hết half track). Mặc định 40s. */
  durationSeconds?: number;
}

/**
 * Infinite horizontal marquee — pure inline style.
 *
 * Pattern: render [...subjects, ...subjects] in a flex row, animate track
 * `translateX 0 → -50%`. Khi lùi đúng nửa chiều dài, vị trí trùng với đầu bản
 * copy thứ hai → loop liền mạch.
 *
 * Animation rule inline trên DOM (style + dangerouslySetInnerHTML cho keyframe)
 * — tránh phụ thuộc Tailwind layer hay React 19 stylesheet hoisting.
 */
const KEYFRAMES = `@keyframes subjectsMarqueeScroll {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
}
.subjects-marquee-track {
  animation: subjectsMarqueeScroll var(--subj-marquee-duration, 40s) linear infinite !important;
}`;

export default function SubjectsCarousel({
  subjects,
  durationSeconds = 40,
}: SubjectsCarouselProps) {
  const [paused, setPaused] = useState(false);

  if (subjects.length === 0) return null;

  const duplicatedSubjects = [...subjects, ...subjects];

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
  };

  const trackStyle: CSSProperties = {
    display: "flex",
    width: "max-content",
    animationPlayState: paused ? "paused" : "running",
    willChange: "transform",
    // duration consumed by .subjects-marquee-track class — passed via CSS var
    ["--subj-marquee-duration" as string]: `${durationSeconds}s`,
  };

  return (
    <div
      style={containerStyle}
      aria-label="Danh sách môn học phổ biến"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div className="subjects-marquee-track" style={trackStyle}>
        {duplicatedSubjects.map((subject, index) => {
          const isDuplicate = index >= subjects.length;

          return (
            <SpotlightCard
              key={`${subject.id}-${index}`}
              spotlightColor="oklch(0.72 0.16 245 / 0.18)"
              spotlightSize={220}
              className="group/card relative mr-3 sm:mr-4 w-42.5 shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none sm:w-47.5"
            >
              <Link
                href={`/tutors?subject=${subject.id}`}
                aria-label={`Xem gia sư môn ${subject.label}`}
                aria-hidden={isDuplicate ? true : undefined}
                tabIndex={isDuplicate ? -1 : undefined}
                className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
              >
                <div className="relative h-22.5 w-full overflow-hidden bg-slate-100 sm:h-25">
                  <Image
                    src={subject.image}
                    alt={subject.label}
                    fill
                    sizes="(max-width: 640px) 170px, 190px"
                    priority={index < Math.min(4, subjects.length)}
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
                  />
                  {/* Persistent tint — unifies tone across heterogeneous subject photos */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(160deg, oklch(0.5 0.15 250 / 0.55) 0%, oklch(0.32 0.08 250 / 0.42) 55%, oklch(0.75 0.15 70 / 0.28) 100%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-300 group-hover/card:opacity-25 motion-reduce:transition-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(29, 78, 216) 0%, transparent 100%)",
                    }}
                  />
                </div>

                <div className="space-y-0.5 px-3 py-2.5">
                  <h3 className="text-xs font-semibold text-foreground transition-colors duration-300 group-hover/card:text-primary sm:text-sm">
                    {subject.label}
                  </h3>
                  <p className="text-[11px] text-muted-foreground transition-colors duration-300 group-hover/card:text-primary/70">
                    {subject.count} gia sư
                  </p>
                </div>
              </Link>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
