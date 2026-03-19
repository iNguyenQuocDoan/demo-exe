import { BookOpen, GraduationCap, Target, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/types";

const MODE_LABEL: Record<string, string> = {
  OFFLINE: "Trực tiếp",
};

export function BookingGoalCard({ booking }: { booking: Booking }) {
  const subjectDisplay = booking.subjectName ?? booking.subject;
  const hasGoalContent =
    booking.parentGoal || (booking.goalTags && booking.goalTags.length > 0);

  // Fallback: nothing to show
  if (!subjectDisplay && !hasGoalContent && !booking.notes) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          Môn học &amp; Mục tiêu
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {/* Subject — prominent highlight */}
        {subjectDisplay && (
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <BookOpen className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Môn học</p>
              <p className="mt-0.5 text-base font-semibold text-foreground">{subjectDisplay}</p>
            </div>
          </div>
        )}

        {/* Grade + teaching mode row */}
        {(booking.grade || booking.teachingMode) && (
          <div className="grid grid-cols-2 gap-3">
            {booking.grade && (
              <div className="rounded-lg border border-border p-3">
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <GraduationCap className="h-3 w-3" />
                  Khối lớp
                </p>
                <p className="mt-1 font-medium text-foreground">{booking.grade}</p>
              </div>
            )}
            {booking.teachingMode && (
              <div className="rounded-lg border border-border p-3">
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <WifiOff className="h-3 w-3" />
                  Hình thức
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {MODE_LABEL[booking.teachingMode] ?? booking.teachingMode}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Goal tags */}
        {booking.goalTags && booking.goalTags.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Mục tiêu nhanh</p>
            <div className="flex flex-wrap gap-1.5">
              {booking.goalTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Parent goal — main text */}
        {booking.parentGoal && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Mục tiêu / ý muốn của phụ huynh
            </p>
            <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 leading-relaxed text-foreground whitespace-pre-wrap">
              {booking.parentGoal}
            </p>
          </div>
        )}

        {/* Fallback: show notes if no parentGoal */}
        {!booking.parentGoal && booking.notes && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Ghi chú</p>
            <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 leading-relaxed text-foreground">
              {booking.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
