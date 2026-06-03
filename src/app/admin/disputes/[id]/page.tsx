"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  BookOpen,
  Calendar,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDispute, resolveDispute } from "@/api/disputeApi";
import { DISPUTE_REASON_LABELS } from "@/types";
import type { DisputeReport, DisputeReportStatus } from "@/types";
import { PageAnimations } from "@/components/animations/PageAnimations";

const WORKFLOW_STEPS: { status: DisputeReportStatus; label: string; desc: string }[] = [
  { status: "Pending", label: "Tiếp nhận", desc: "Khiếu nại đã được ghi nhận, chờ admin xem xét" },
  { status: "Reviewing", label: "Đang xem xét", desc: "Admin đang xác minh thông tin và liên hệ các bên" },
  { status: "Resolved", label: "Đã giải quyết", desc: "Khiếu nại đã được xử lý xong" },
];

const STATUS_ORDER: DisputeReportStatus[] = ["Pending", "Reviewing", "Resolved"];

function WorkflowTimeline({ current }: { current: DisputeReportStatus }) {
  const isDismissed = current === "Dismissed";
  const currentIdx = STATUS_ORDER.indexOf(current);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tiến trình xử lý</h3>
      {isDismissed ? (
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
          <XCircle className="h-6 w-6 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-semibold">Đã bác bỏ</p>
            <p className="text-sm text-muted-foreground">Khiếu nại này đã bị bác bỏ bởi admin</p>
          </div>
        </div>
      ) : (
        <ol className="relative ml-3 border-l border-border space-y-6">
          {WORKFLOW_STEPS.map((step, idx) => {
            const done = currentIdx > idx;
            const active = currentIdx === idx;
            return (
              <li key={step.status} className="ml-6">
                <span className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-emerald-500 bg-emerald-500"
                    : active
                    ? "border-primary bg-primary"
                    : "border-border bg-background"
                }`}>
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : active ? (
                    <Clock className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  )}
                </span>
                <div className={active ? "opacity-100" : done ? "opacity-80" : "opacity-40"}>
                  <p className={`text-sm font-semibold ${active ? "text-primary" : done ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

const STATUS_BADGE: Record<DisputeReportStatus, { label: string; variant: Parameters<typeof Badge>[0]["variant"] }> = {
  Pending: { label: "Chờ xử lý", variant: "warning" },
  Reviewing: { label: "Đang xem xét", variant: "default" },
  Resolved: { label: "Đã giải quyết", variant: "success" },
  Dismissed: { label: "Bác bỏ", variant: "secondary" },
};

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<DisputeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDispute(id).then((r) => {
      setReport(r);
      setAdminNote(r?.adminNote ?? "");
      setLoading(false);
    });
  }, [id]);

  // BE chỉ có resolve: Resolved = hoàn tiền PH, còn lại = không hoàn (bác bỏ).
  const handleAction = async (status: DisputeReportStatus) => {
    if (!report) return;
    setSaving(true);
    const res = await resolveDispute(report.id, {
      resolution: status === "Resolved" ? "FULL_REFUND" : "DISMISSED",
      adminNote: adminNote.trim() || undefined,
    });
    if (res.ok) {
      setReport({
        ...report,
        status,
        adminNote: adminNote.trim() || undefined,
        resolvedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">Không tìm thấy báo cáo</p>
        <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  const meta = STATUS_BADGE[report.status];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <PageAnimations />
      {/* Back + header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Chi tiết khiếu nại #{report.id}</h1>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(report.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <WorkflowTimeline current={report.status} />

        {/* Parties */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Người khiếu nại</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">{report.reporterName}</span>
              <Badge variant="outline" className="text-xs capitalize">{report.reporterRole}</Badge>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bị khiếu nại</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-destructive" />
              <span className="font-medium">{report.reportedName}</span>
              <Badge variant="outline" className="text-xs capitalize">{report.reportedRole}</Badge>
            </div>
          </div>
        </div>

        {/* Booking + Reason */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Booking:</span>
            <span className="font-medium">#{report.bookingId}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">Lý do:</span>
            <span className="font-medium">{DISPUTE_REASON_LABELS[report.reason]}</span>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mô tả chi tiết</p>
            <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">{report.description}</p>
          </div>
        </div>

        {/* Timestamps */}
        {report.resolvedAt && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm text-emerald-700 dark:text-emerald-400">
            <Calendar className="h-4 w-4" />
            <span>Giải quyết lúc: {new Date(report.resolvedAt).toLocaleString("vi-VN")}</span>
            {report.resolvedBy && <span className="ml-1 text-muted-foreground">bởi {report.resolvedBy}</span>}
          </div>
        )}

        {/* Admin panel */}
        {(report.status === "Pending" || report.status === "Reviewing") && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="font-semibold">Xử lý admin</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ghi chú admin</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Nhập ghi chú xử lý (tuỳ chọn)..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleAction("Resolved")}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Giải quyết (hoàn tiền PH)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction("Dismissed")}
                disabled={saving}
                className="text-muted-foreground"
              >
                <XCircle className="mr-2 h-4 w-4" /> Bác bỏ khiếu nại
              </Button>
              {saved && <span className="self-center text-sm text-emerald-600">Đã lưu</span>}
            </div>
          </div>
        )}

        {/* Existing admin note (read-only for resolved/dismissed) */}
        {(report.status === "Resolved" || report.status === "Dismissed") && report.adminNote && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Ghi chú admin</p>
            </div>
            <p className="text-sm text-muted-foreground">{report.adminNote}</p>
          </div>
        )}
    </div>
  );
}
