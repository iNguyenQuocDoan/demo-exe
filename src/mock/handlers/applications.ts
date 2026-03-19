import { db } from "../db";
import type { TutorApplication, TutorApplicationStatus } from "@/types";

function currentUserId(): string {
  if (typeof window === "undefined") return "";
  try { return (JSON.parse(localStorage.getItem("auth_user") ?? "{}") as { id?: string }).id ?? ""; }
  catch { return ""; }
}

function uid(): string { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export function handleGetApplications(params: Record<string, string>) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
  let list = [...db.applications];
  if (params.status) list = list.filter((a) => a.status === params.status);
  list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const total = list.length;
  const applications = list.slice((page - 1) * limit, page * limit);
  return { status: 200, data: { ok: true, applications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
}

export function handleGetMyApplication() {
  const userId = currentUserId();
  const app = db.applications.find((a) => a.userId === userId) ?? null;
  return { status: 200, data: { ok: true, application: app } };
}

export function handleGetApplication(id: string) {
  const app = db.applications.find((a) => a.id === id);
  if (!app) return { status: 404, data: { ok: false, error: "Application not found" } };
  return { status: 200, data: { ok: true, application: app } };
}

export function handleSubmitApplication(body: Omit<TutorApplication, "id" | "status" | "submittedAt"> & { status?: string; submittedAt?: string }) {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };

  const app: TutorApplication = {
    ...body,
    id: `app_${uid()}`,
    userId,
    status: "Submitted",
    submittedAt: new Date().toISOString(),
  };
  db.applications.push(app);
  db.saveApplications();

  // Update user role to tutorCandidate
  const u = db.rawUsers.find((u) => u.id === userId);
  if (u) {
    u.role = "tutorCandidate";
    u.tutorApplicationId = app.id;
  }
  return { status: 201, data: { ok: true, applicationId: app.id, application: app } };
}

export function handleUpdateApplicationStatus(id: string, body: { status?: TutorApplicationStatus; adminNotes?: string; rejectionReason?: string }) {
  const app = db.applications.find((a) => a.id === id);
  if (!app) return { status: 404, data: { ok: false, error: "Application not found" } };
  if (body.status) app.status = body.status;
  if (body.adminNotes) app.adminNotes = body.adminNotes;
  if (body.rejectionReason) app.rejectionReason = body.rejectionReason;
  app.reviewedAt = new Date().toISOString();
  db.saveApplications();

  // If approved, create tutor profile and update user role
  if (body.status === "Approved") {
    const u = db.rawUsers.find((u) => u.id === app.userId);
    if (u) {
      const tutorProfileId = `tutor_${u.id}`;
      u.role = "tutor";
      u.tutorProfileId = tutorProfileId;
      db.tutors.push({
        id: tutorProfileId, fullName: app.fullName,
        avatarUrl: u.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutorProfileId}`,
        bio: app.bio, teachingMode: app.teachingMode, subjects: app.subjects,
        grades: app.grades, pricePerHour: app.pricePerHour, profileStatus: "Approved",
        serviceAreas: { cityId: app.cityId, districtIds: app.districtIds },
        ratingAvg: 0, reviewCount: 0, experience: app.experience, education: app.education,
      });
    }
  }
  if (body.status === "Rejected") {
    const u = db.rawUsers.find((u) => u.id === app.userId);
    if (u && u.role === "tutorCandidate") u.role = "guest";
  }
  return { status: 200, data: { ok: true, application: app } };
}

export function handleResubmitApplication(id: string, body: Partial<TutorApplication> & { resubmissionNotes?: string }) {
  const app = db.applications.find((a) => a.id === id);
  if (!app) return { status: 404, data: { ok: false, error: "Not found" } };
  Object.assign(app, body, { status: "Submitted" as TutorApplicationStatus, submittedAt: new Date().toISOString() });
  db.saveApplications();
  return { status: 200, data: { ok: true, application: app } };
}
