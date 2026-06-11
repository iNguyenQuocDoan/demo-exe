"use client";

import { useEffect, useState } from "react";
import { Clock, Flag, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { getMyDisputes, type DisputeItem } from "@/api/feedbackApi";
import { Badge } from "@/components/ui/badge";

const STATUS_META: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  variant: Parameters<typeof Badge>[0]["variant"];
}> = {
  PENDING: { label: "Chờ xử lý", icon: Clock, color: "text-amber-600", variant: "warning" },
  OPEN: { label: "Chờ xử lý", icon: Clock, color: "text-amber-600", variant: "warning" },
  RESOLVED: { label: "Đã giải quyết", icon: CheckCircle2, color: "text-emerald-600", variant: "success" },
  ACCEPTED: { label: "Đã giải quyết", icon: CheckCircle2, color: "text-emerald-600", variant: "success" },
  REJECTED: { label: "Bác bỏ", icon: XCircle, color: "text-muted-foreground", variant: "secondary" },
  DISMISSED: { label: "Bác bỏ", icon: XCircle, color: "text-muted-foreground", variant: "secondary" },
};

function getStatusMeta(status: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized.includes("RESOLV") || normalized.includes("ACCEPT")) return STATUS_META.RESOLVED;
  if (normalized.includes("REJECT") || normalized.includes("DISMISS")) return STATUS_META.REJECTED;
  return STATUS_META.PENDING;
}

function ReportItem({ report }: { report: DisputeItem }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getStatusMeta(report.status);
  const Icon = meta.icon;
  const createdAt = new Date(report.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
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
            <span className="text-xs text-muted-foreground">{createdAt}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Bên khiếu nại: <span className="font-semibold text-foreground">{report.parentEmail}</span> | Gia sư: <span className="font-semibold text-foreground">{report.tutorName}</span>
          </p>
          <p className="text-sm font-medium text-foreground line-clamp-1">{report.reason}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border space-y-3 pt-3">
          {/* Detail Reason */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Chi tiết khiếu nại</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{report.reason}</p>
          </div>

          {/* Responder Reply */}
          {report.responderReply ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 space-y-0.5">
              <p className="text-xs font-semibold text-primary">Phản hồi từ bên bị khiếu nại</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{report.responderReply}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Bên bị khiếu nại chưa có phản hồi.
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
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMyDisputes()
      .then((data) => {
        if (!active) return;
        const filtered = data.filter((item) => item.bookingId === bookingId);
        setDisputes(filtered);
      })
      .catch((err) => {
        console.error("Lỗi khi tải khiếu nại booking:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingId, refreshKey]);

  if (loading) return null;
  if (disputes.length === 0) return null;

  return (
    <div className="surface-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4 text-destructive" />
        <h3 className="text-sm font-semibold text-foreground">Tranh chấp / Khiếu nại thực tế</h3>
      </div>

      <div className="space-y-2">
        {disputes.map((d) => (
          <ReportItem key={d.id} report={d} />
        ))}
      </div>
    </div>
  );
}
