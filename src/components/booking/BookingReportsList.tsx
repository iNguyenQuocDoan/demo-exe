"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Flag, AlertTriangle, XCircle } from "lucide-react";
import { getMyReports, getReportsAgainstMe } from "@/api/reportApi";
import { Badge } from "@/components/ui/badge";
import { DISPUTE_REASON_LABELS } from "@/types";
import type { DisputeReport, DisputeReportStatus } from "@/types";

const STATUS_META: Record<DisputeReportStatus, {
  label: string;
  icon: React.ElementType;
  color: string;
  variant: Parameters<typeof Badge>[0]["variant"];
}> = {
  Pending: { label: "Chờ xử lý", icon: Clock, color: "text-amber-600", variant: "warning" },
  Reviewing: { label: "Đang xem xét", icon: AlertTriangle, color: "text-blue-600", variant: "default" },
  Resolved: { label: "Đã giải quyết", icon: CheckCircle2, color: "text-emerald-600", variant: "success" },
  Dismissed: { label: "Bác bỏ", icon: XCircle, color: "text-muted-foreground", variant: "secondary" },
};

function ReportItem({ report, perspective }: { report: DisputeReport; perspective: "sent" | "received" }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[report.status];
  const Icon = meta.icon;
  const createdAt = new Date(report.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
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
            <span className="text-xs text-muted-foreground">{createdAt}</span>
          </div>
          {/* Reporter → Reported arrow */}
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{report.reporterName}</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="font-medium text-foreground">{report.reportedName}</span>
          </p>
          <p className="text-sm font-medium text-foreground">{DISPUTE_REASON_LABELS[report.reason]}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border space-y-3">
          {/* Description */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Mô tả chi tiết</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{report.description}</p>
          </div>

          {/* Admin response */}
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
        </div>
      )}
    </div>
  );
}

interface Props {
  bookingId: string;
  refreshKey?: number;
}

export function BookingReportsList({ bookingId, refreshKey }: Props) {
  const [sent, setSent] = useState<DisputeReport[]>([]);
  const [received, setReceived] = useState<DisputeReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMyReports({ bookingId }),
      getReportsAgainstMe({ bookingId }),
    ])
      .then(([s, r]) => { setSent(s); setReceived(r); })
      .finally(() => setLoading(false));
  }, [bookingId, refreshKey]);

  if (loading) return null;
  if (sent.length === 0 && received.length === 0) return null;

  return (
    <div className="surface-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4 text-destructive" />
        <h3 className="text-sm font-semibold text-foreground">Báo cáo tranh chấp</h3>
      </div>

      {/* Reports sent by me */}
      {sent.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Bạn đã gửi ({sent.length})
          </p>
          {sent.map((r) => (
            <ReportItem key={r.id} report={r} perspective="sent" />
          ))}
        </div>
      )}

      {/* Reports filed against me */}
      {received.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-destructive uppercase tracking-wide">
            Báo cáo về bạn ({received.length})
          </p>
          {received.map((r) => (
            <ReportItem key={r.id} report={r} perspective="received" />
          ))}
        </div>
      )}
    </div>
  );
}
