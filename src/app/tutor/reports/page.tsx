"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  XCircle,
} from "lucide-react";
import { getMyReports, getReportsAgainstMe } from "@/api/reportApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DISPUTE_REASON_LABELS } from "@/types";
import type { DisputeReport, DisputeReportStatus } from "@/types";

const STATUS_META: Record<
  DisputeReportStatus,
  { label: string; icon: React.ElementType; color: string; variant: Parameters<typeof Badge>[0]["variant"] }
> = {
  Pending: { label: "Chờ xử lý", icon: Clock, color: "text-amber-600", variant: "warning" },
  Reviewing: { label: "Đang xem xét", icon: AlertTriangle, color: "text-blue-600", variant: "default" },
  Resolved: { label: "Đã giải quyết", icon: CheckCircle2, color: "text-emerald-600", variant: "success" },
  Dismissed: { label: "Bác bỏ", icon: XCircle, color: "text-muted-foreground", variant: "secondary" },
};

function ReportRow({ report, perspective }: { report: DisputeReport; perspective: "sent" | "received" }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[report.status];
  const Icon = meta.icon;
  const createdAt = new Date(report.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.color}`} />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            {perspective === "received" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive font-medium">
                Báo cáo về bạn
              </span>
            )}
            <span className="text-xs text-muted-foreground">Booking #{report.bookingId}</span>
            <span className="text-xs text-muted-foreground">· {createdAt}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{report.reporterName}</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="font-medium text-foreground">{report.reportedName}</span>
          </div>
          <p className="text-sm font-medium text-foreground">{DISPUTE_REASON_LABELS[report.reason]}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border space-y-3 pt-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Mô tả chi tiết</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{report.description}</p>
          </div>
          {report.adminNote ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 space-y-0.5">
              <p className="text-xs font-semibold text-primary">Phản hồi từ admin</p>
              <p className="text-sm text-foreground">{report.adminNote}</p>
              {report.resolvedAt && (
                <p className="text-xs text-muted-foreground">
                  {new Date(report.resolvedAt).toLocaleDateString("vi-VN")}
                  {report.resolvedBy ? ` · ${report.resolvedBy}` : ""}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Admin chưa có phản hồi. Thời gian xử lý thường 1–2 ngày làm việc.
            </p>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/tutor/bookings/${report.bookingId}`}>Xem booking</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

const TABS: { value: "all" | "sent" | "received"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "sent", label: "Bạn đã gửi" },
  { value: "received", label: "Báo cáo về bạn" },
];

export default function TutorReportsPage() {
  const [sent, setSent] = useState<DisputeReport[]>([]);
  const [received, setReceived] = useState<DisputeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "sent" | "received">("all");

  useEffect(() => {
    setLoading(true);
    Promise.all([getMyReports(), getReportsAgainstMe()])
      .then(([s, r]) => { setSent(s); setReceived(r); })
      .finally(() => setLoading(false));
  }, []);

  const displayed = useMemo(() => {
    if (tab === "sent") return sent.map((r) => ({ report: r, perspective: "sent" as const }));
    if (tab === "received") return received.map((r) => ({ report: r, perspective: "received" as const }));
    return [
      ...sent.map((r) => ({ report: r, perspective: "sent" as const })),
      ...received.map((r) => ({ report: r, perspective: "received" as const })),
    ].sort((a, b) => new Date(b.report.createdAt).getTime() - new Date(a.report.createdAt).getTime());
  }, [sent, received, tab]);

  if (loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-5">

          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
                  <Flag className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Báo cáo tranh chấp</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Các báo cáo bạn đã gửi và nhận được từ phụ huynh.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/tutor/bookings">
                  <ArrowLeft className="h-4 w-4" />
                  Lịch đặt
                </Link>
              </Button>
            </div>
          </header>

          <div className="surface-card p-5 space-y-4">
            {sent.length === 0 && received.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <Flag className="h-10 w-10 opacity-20" />
                <p className="text-sm font-medium">Chưa có báo cáo tranh chấp nào.</p>
                <p className="text-xs">Các báo cáo bạn gửi hoặc nhận sẽ xuất hiện ở đây.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {TABS.map((t) => {
                    const count = t.value === "all"
                      ? sent.length + received.length
                      : t.value === "sent" ? sent.length : received.length;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTab(t.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          tab === t.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {t.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {displayed.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Không có báo cáo nào trong mục này.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {displayed.map(({ report, perspective }) => (
                      <ReportRow key={`${perspective}-${report.id}`} report={report} perspective={perspective} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}
