"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Star,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CARD_TOKENS, AppCard } from "@/components/shared/AppCard";
import { formatCurrency } from "@/lib/utils";
import type { TutorProfile } from "@/types";

interface Props {
  tutor: TutorProfile;
  subjectMap?: Record<string, string>;
  districtMap?: Record<string, string>;
}

function formatExperienceLabel(experience: string): string {
  const trimmed = experience.trim();
  const yearMatch = trimmed.match(/^(\d+)\s*years?$/i);
  if (yearMatch) return `${yearMatch[1]} năm kinh nghiệm`;
  return trimmed;
}

function formatGrades(grades: string[]) {
  if (!grades.length) return "Lớp học linh hoạt";
  const visible = grades.slice(0, 4).join(", ");
  return `Lớp ${visible}${grades.length > 4 ? ` +${grades.length - 4}` : ""}`;
}

export function TutorCard({ tutor, subjectMap = {}, districtMap = {} }: Props) {
  const experienceLabel = formatExperienceLabel(tutor.experience);
  const gradeLabel = formatGrades(tutor.grades);
  const [avatarSrc, setAvatarSrc] = useState(tutor.avatarUrl);

  const districts = tutor.serviceAreas.districtIds
    .slice(0, 2)
    .map((id) => districtMap[id] ?? id);

  return (
    <AppCard className="group relative min-h-full overflow-hidden border-border/80 bg-card/98 shadow-sm shadow-slate-950/4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/8">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12),transparent_65%)]" />
      </div>

      <div
        className={`relative h-1 ${tutor.isPremiumOnly ? "bg-linear-to-r from-amber-400 via-orange-400 to-yellow-300" : "bg-linear-to-r from-primary via-sky-500 to-emerald-400"}`}
      />

      <div className={`${CARD_TOKENS.content} relative flex min-h-full flex-col`}>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Image
              src={avatarSrc}
              alt={tutor.fullName}
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl border border-border bg-muted object-cover shadow-sm"
              onError={() => setAvatarSrc(`https://api.dicebear.com/7.x/initials/svg?seed=${tutor.fullName}`)}
            />
            <span className="absolute -bottom-1.5 -right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-success shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                {tutor.fullName}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Đã xác minh
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {tutor.education}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {tutor.ratingAvg}
                <span className="font-normal text-muted-foreground">({tutor.reviewCount})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                {experienceLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-muted/35 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Học phí</div>
            <div className="mt-1 text-lg font-bold leading-none text-primary">{formatCurrency(tutor.pricePerHour)}</div>
            <div className="mt-1 text-xs text-muted-foreground">mỗi giờ</div>
          </div>
          <div className="rounded-xl border border-border bg-muted/35 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phù hợp</div>
            <div className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{gradeLabel}</div>
            <div className="mt-1 text-xs text-muted-foreground">theo hồ sơ</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/12">
            <WifiOff className="h-3.5 w-3.5" />
            Học trực tiếp
          </span>
          {tutor.isPremiumOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <Crown className="h-3.5 w-3.5" />
              Premium
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <BookOpen className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.slice(0, 4).map((id) => (
                <Badge key={id} variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-semibold">
                  {subjectMap[id] ?? id}
                </Badge>
              ))}
              {tutor.subjects.length > 4 && (
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                  +{tutor.subjects.length - 4}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-2 text-muted-foreground sm:grid-cols-2">
            {districts.length > 0 && (
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">
                  {districts.join(", ")}
                  {tutor.serviceAreas.districtIds.length > 2
                    ? ` +${tutor.serviceAreas.districtIds.length - 2}`
                    : ""}
                </span>
              </span>
            )}
            <span className="flex min-w-0 items-center gap-1.5">
              <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{gradeLabel}</span>
            </span>
          </div>
        </div>

        {tutor.bio && (
          <p className="mt-4 line-clamp-2 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
            {tutor.bio}
          </p>
        )}

        <div className="mt-auto grid grid-cols-1 gap-2.5 pt-5 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg" className={CARD_TOKENS.cta}>
            <Link href={`/tutors/${tutor.id}`}>Xem hồ sơ</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className={`${CARD_TOKENS.cta} bg-accent text-accent-foreground shadow-sm shadow-amber-500/20 hover:bg-accent/90`}
          >
            <Link href={`/tutors/${tutor.id}`}>
              <CalendarDays className="h-4 w-4" />
              Đặt lịch
            </Link>
          </Button>
        </div>
      </div>
    </AppCard>
  );
}
