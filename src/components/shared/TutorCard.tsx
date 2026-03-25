"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  MapPin,
  Star,
  WifiOff,
  ShieldCheck,
  Crown,
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

export function TutorCard({ tutor, subjectMap = {}, districtMap = {} }: Props) {
  const experienceLabel = formatExperienceLabel(tutor.experience);

  const districts = tutor.serviceAreas.districtIds
    .slice(0, 2)
    .map((id) => districtMap[id] ?? id);

  return (
    <AppCard className="group min-h-90 overflow-hidden">
      <div
        className={`h-1.5 ${tutor.isPremiumOnly ? "bg-linear-to-r from-amber-400 via-orange-400 to-yellow-300" : "bg-linear-to-r from-primary via-primary/80 to-accent"}`}
      />

      <div className={CARD_TOKENS.content}>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={tutor.avatarUrl}
              alt={tutor.fullName}
              className={`${CARD_TOKENS.avatar} rounded-2xl border border-border object-cover shadow-sm`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://api.dicebear.com/7.x/initials/svg?seed=${tutor.fullName}`;
              }}
            />
            <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-success">
              <ShieldCheck className="h-3 w-3 text-white" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`${CARD_TOKENS.title} truncate group-hover:text-primary`}>
                {tutor.fullName}
              </h3>
              {tutor.isPremiumOnly && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                  <Crown className="h-3 w-3" /> Premium
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {tutor.education}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-semibold text-foreground">
                {tutor.ratingAvg}
              </span>
              <span className="text-sm text-muted-foreground">
                ({tutor.reviewCount} đánh giá)
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-2xl font-bold text-primary leading-tight">
              {formatCurrency(tutor.pricePerHour)}
            </div>
            <div className="text-sm text-muted-foreground">/giờ</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <WifiOff className="h-3.5 w-3.5" /> Trực tiếp
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
          {tutor.subjects.slice(0, 4).map((id) => (
            <Badge key={id} variant="secondary" className="px-2.5 py-1 text-xs font-medium">
              {subjectMap[id] ?? id}
            </Badge>
          ))}
          {tutor.subjects.length > 4 && (
            <Badge variant="outline" className="px-2.5 py-1 text-xs">
              +{tutor.subjects.length - 4}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {districts.length > 0 && (
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">
                {districts.join(", ")}
                {tutor.serviceAreas.districtIds.length > 2
                  ? ` +${tutor.serviceAreas.districtIds.length - 2}`
                  : ""}
              </span>
            </span>
          )}
          <span className="flex items-center gap-1.5 shrink-0">
            <Clock className="h-4 w-4 text-primary" />
            {experienceLabel}
          </span>
        </div>

        {tutor.bio && (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground border-t border-border pt-4">
            {tutor.bio}
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg" className={CARD_TOKENS.cta}>
            <Link href={`/tutors/${tutor.id}`}>Xem hồ sơ</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className={`${CARD_TOKENS.cta} bg-accent hover:bg-accent/90 text-accent-foreground`}
          >
            <Link href={`/tutors/${tutor.id}`}>Đặt lịch</Link>
          </Button>
        </div>
      </div>
    </AppCard>
  );
}
