"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Flag,
  XCircle,
} from "lucide-react";
import { getDisputes, resolveDispute } from "@/api/disputeApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DISPUTE_STATUS_META } from "@/lib/statusMeta";
import { Skeleton } from "@/components/ui/skeleton";
import { DISPUTE_REASON_LABELS } from "@/types";
import type { DisputeReport, DisputeReportStatus } from "@/types";

// BE DisputeStatus chỉ có PENDING/RESOLVED/REJECTED(→Dismissed) — không có "Reviewing".
const STATUS_TABS: { value: DisputeReportStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Resolved", label: "Đã giải quyết" },
  { value: "Dismissed", label: "Không hợp lệ" },
];

function DisputeRow({ report, onUpdate }: { report: DisputeReport; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [adminNote, setAdminNote] = useState(report.adminNote ?? "");
  const [saving, setSaving] = useState(false);
  const [actErr, setActErr] = useState("");

  // BE chỉ hỗ trợ resolve: Resolved = hoàn tiền cho phụ huynh, Dismissed = không hoàn.
  const handleAction = async (status: DisputeReportStatus) => {
    setSaving(true);
    setActErr("");
    try {
      const res = await resolveDispute(report.id, {
        resolution: status === "Resolved" ? "FULL_REFUND" : "DISMISSED",
        adminNote: adminNote.trim() || undefined,
      });
      if (res.ok) onUpdate();
      else setActErr(res.error ?? "Máy chủ không xử lý được khiếu nại này.");
    } finally {
      setSaving(false);
    }
  };

  const createdAt = new Date(report.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <Flag className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge registry={DISPUTE_STATUS_META} value={report.status} />
            <span className="text-xs text-muted-foreground">Booking #{report.bookingId}</span>
            <span className="text-xs text-muted-foreground">· {createdAt}</span>
          </div>
          {/* Reporter → Reported */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 font-medium text-amber-800">
              {report.reporterName}
              <span className="ml-1 font-normal opacity-70">({report.reporterRole === "parent" ? "PH" : "GS"})</span>
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="rounded-md bg-destructive/10 border border-destructive/20 px-2 py-0.5 font-medium text-destructive">
              {report.reportedName}
              <span className="ml-1 font-normal opacity-70">({report.reportedRole === "parent" ? "PH" : "GS"})</span>
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">{DISPUTE_REASON_LABELS[report.reason]}</p>
          <p className="text-xs text-muted-foreground truncate">
            {report.description.slice(0, 90)}{report.description.length > 90 ? "…" : ""}
          </p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border space-y-4">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-0.5">
              <p className="text-xs font-semibold text-amber-700">Người báo cáo</p>
              <p className="text-sm font-medium text-foreground">{report.reporterName}</p>
              <p className="text-xs text-muted-foreground">{report.reporterRole === "parent" ? "Phụ huynh" : "Gia sư"}</p>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 space-y-0.5">
              <p className="text-xs font-semibold text-destructive">Người bị báo cáo</p>
              <p className="text-sm font-medium text-foreground">{report.reportedName}</p>
              <p className="text-xs text-muted-foreground">{report.reportedRole === "parent" ? "Phụ huynh" : "Gia sư"}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Mô tả chi tiết</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{report.description}</p>
          </div>

          {/* Previous admin note */}
          {report.adminNote && !saving && (
            <div className="rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium">Ghi chú admin:</span> {report.adminNote}
              {report.resolvedAt && (
                <span className="ml-1 opacity-60">
                  · {new Date(report.resolvedAt).toLocaleDateString("vi-VN")}
                  {report.resolvedBy ? ` · ${report.resolvedBy}` : ""}
                </span>
              )}
            </div>
          )}

          {/* Admin note input + actions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Ghi chú xử lý (tuỳ chọn)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập ghi chú về quyết định xử lý…"
              className="w-full min-h-18 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none outline-none focus:border-primary transition-colors"
              maxLength={300}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {report.status === "Pending" && (
              <>
                <Button size="sm" className="gap-1.5" loading={saving} onClick={() => void handleAction("Resolved")}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Giải quyết (hoàn tiền PH)
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground" loading={saving} onClick={() => void handleAction("Dismissed")}>
                  <XCircle className="h-3.5 w-3.5" />
                  Bác bỏ (không hoàn)
                </Button>
              </>
            )}
            {(report.status === "Resolved" || report.status === "Dismissed") && (
              <span className="text-xs text-muted-foreground italic">Đã xử lý xong</span>
            )}
            {actErr && (
              <span className="w-full text-xs text-destructive">{actErr}</span>
            )}
            <Link href={`/admin/disputes/${report.id}`}>
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground ml-auto">
                <ExternalLink className="h-3.5 w-3.5" />
                Xem chi tiết
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<DisputeReportStatus | "all">("all");

  const loadDisputes = async () => {
    // BE: GET /feedback/dispute/pending — chỉ trả khiếu nại đang chờ xử lý.
    setDisputes(await getDisputes());
  };

  useEffect(() => {
    setLoading(true);
    void loadDisputes().finally(() => setLoading(false));
  }, []);

  const filteredDisputes = useMemo(() => {
    if (statusFilter === "all") return disputes;
    return disputes.filter((r) => r.status === statusFilter);
  }, [disputes, statusFilter]);

  const pendingCount = disputes.filter((r) => r.status === "Pending").length;

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
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-5">

          {/* Header */}
          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
                  <Flag className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">Tranh chấp & Báo cáo</h1>
                    {pendingCount > 0 && (
                      <Badge variant="destructive">{pendingCount} chờ xử lý</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Quản lý và xử lý các báo cáo tranh chấp giữa phụ huynh và gia sư.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin">Quay lại dashboard</Link>
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="surface-card p-5 space-y-4">
            {disputes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <AlertTriangle className="h-10 w-10 opacity-20" />
                <p className="text-sm font-medium">Chưa có báo cáo tranh chấp nào.</p>
                <p className="text-xs">Khi phụ huynh hoặc gia sư gửi báo cáo, chúng sẽ xuất hiện ở đây.</p>
              </div>
            ) : (
              <>
                {/* Status filters */}
                <div className="flex flex-wrap gap-2">
                  {STATUS_TABS.map((tab) => {
                    const count = tab.value === "all"
                      ? disputes.length
                      : disputes.filter((r) => r.status === tab.value).length;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setStatusFilter(tab.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          statusFilter === tab.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {tab.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {filteredDisputes.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Không có báo cáo nào với trạng thái này.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredDisputes.map((report) => (
                      <DisputeRow
                        key={report.id}
                        report={report}
                        onUpdate={() => void loadDisputes()}
                      />
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
