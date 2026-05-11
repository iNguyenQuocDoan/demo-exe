import { db } from "../db";
import type { DisputeReport, DisputeReason, DisputeReportStatus } from "@/types";

function uid(): string {
  return `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function currentUser(): { id: string; fullName: string; role: string; tutorProfileId?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("auth_user") ?? "null") as {
      id: string;
      fullName: string;
      role: string;
      tutorProfileId?: string;
    } | null;
  } catch {
    return null;
  }
}

export function handleCreateReport(body: {
  bookingId?: string;
  reason?: DisputeReason;
  description?: string;
}) {
  const user = currentUser();
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  if (user.role !== "parent" && user.role !== "tutor")
    return { status: 403, data: { ok: false, error: "Chỉ phụ huynh hoặc gia sư mới có thể báo cáo." } };
  if (!body.bookingId) return { status: 400, data: { ok: false, error: "Thiếu bookingId." } };
  if (!body.reason) return { status: 400, data: { ok: false, error: "Vui lòng chọn lý do." } };
  if (!body.description?.trim()) return { status: 400, data: { ok: false, error: "Vui lòng mô tả chi tiết." } };

  const booking = db.bookings.find((b) => b.id === body.bookingId);
  if (!booking) return { status: 404, data: { ok: false, error: "Không tìm thấy booking." } };

  // Prevent duplicate open reports for same booking+reporter
  const dup = db.reports.find(
    (r) =>
      r.bookingId === body.bookingId &&
      r.reporterId === user.id &&
      (r.status === "Pending" || r.status === "Reviewing"),
  );
  if (dup) return { status: 409, data: { ok: false, error: "Bạn đã có báo cáo đang xử lý cho buổi học này." } };

  // Resolve the reported party from booking
  let reportedId: string;
  let reportedRole: "parent" | "tutor";
  let reportedName: string;

  if (user.role === "parent") {
    // Reporter = parent → reported = tutor
    reportedRole = "tutor";
    const tutorUser = db.rawUsers.find((u) => u.tutorProfileId === booking.tutorId);
    reportedId = tutorUser?.id ?? booking.tutorId;
    reportedName = tutorUser?.fullName ?? booking.tutorId;
  } else {
    // Reporter = tutor → reported = parent
    reportedRole = "parent";
    const parentUser = db.rawUsers.find((u) => u.id === booking.parentId);
    reportedId = booking.parentId;
    reportedName = parentUser?.fullName ?? booking.parentId;
  }

  const report: DisputeReport = {
    id: uid(),
    bookingId: body.bookingId,
    reporterId: user.id,
    reporterRole: user.role as "parent" | "tutor",
    reporterName: user.fullName,
    reportedId,
    reportedRole,
    reportedName,
    reason: body.reason,
    description: body.description.trim(),
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  db.reports.unshift(report);
  db.saveReports();
  return { status: 201, data: { ok: true, report } };
}

export function handleGetReport(id: string) {
  const report = db.reports.find((r) => r.id === id);
  if (!report) return { status: 404, data: { ok: false, error: "Không tìm thấy báo cáo." } };
  return { status: 200, data: { ok: true, report } };
}

export function handleGetReports(params: Record<string, string>) {
  let list = [...db.reports];
  if (params.status) list = list.filter((r) => r.status === params.status);
  if (params.bookingId) list = list.filter((r) => r.bookingId === params.bookingId);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { status: 200, data: { ok: true, reports: list, total: list.length } };
}

export function handleGetMyReports(params: Record<string, string>) {
  const user = currentUser();
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  let list = db.reports.filter((r) => r.reporterId === user.id);
  if (params.bookingId) list = list.filter((r) => r.bookingId === params.bookingId);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { status: 200, data: { ok: true, reports: list } };
}

export function handleGetReportsAgainstMe(params: Record<string, string>) {
  const user = currentUser();
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  // Match by user id; for tutors also match by tutorProfileId (in case stored differently)
  let list = db.reports.filter(
    (r) => r.reportedId === user.id || (user.tutorProfileId && r.reportedId === user.tutorProfileId),
  );
  if (params.bookingId) list = list.filter((r) => r.bookingId === params.bookingId);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { status: 200, data: { ok: true, reports: list } };
}

export function handleUpdateReport(
  id: string,
  body: { status?: DisputeReportStatus; adminNote?: string },
) {
  const idx = db.reports.findIndex((r) => r.id === id);
  if (idx === -1) return { status: 404, data: { ok: false, error: "Không tìm thấy báo cáo." } };

  const user = currentUser();
  const updated: DisputeReport = { ...db.reports[idx] };
  if (body.status) updated.status = body.status;
  if (body.adminNote !== undefined) updated.adminNote = body.adminNote;
  if (body.status === "Resolved" || body.status === "Dismissed") {
    updated.resolvedAt = new Date().toISOString();
    updated.resolvedBy = user?.fullName ?? "Admin";
  }

  db.reports[idx] = updated;
  db.saveReports();
  return { status: 200, data: { ok: true, report: updated } };
}
