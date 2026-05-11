import { db } from "../db";

function currentUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("auth_user") ?? "null") as {
      id: string;
      role: string;
      tutorProfileId?: string;
    } | null;
  } catch {
    return null;
  }
}

function isoWeekLabel(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function monthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function handleGetTutorAnalytics() {
  const user = currentUser();
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  if (user.role !== "tutor") return { status: 403, data: { ok: false, error: "Forbidden" } };

  const tutorId = user.tutorProfileId ?? user.id;
  const completed = db.bookings.filter(
    (b) => b.tutorId === tutorId && b.status === "Completed",
  );

  // ── Weekly earnings (last 8 weeks) ────────────────────────────────────────
  const weekMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weekMap[isoWeekLabel(d.toISOString())] = 0;
  }
  completed.forEach((b) => {
    const label = isoWeekLabel(b.startAt);
    if (label in weekMap) weekMap[label] += b.baseAmount * 0.9;
  });
  const weeklyEarnings = Object.entries(weekMap).map(([week, amount]) => ({ week, amount: Math.round(amount) }));

  // ── Monthly sessions (last 6 months) ──────────────────────────────────────
  const monthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    monthMap[monthLabel(d.toISOString())] = 0;
  }
  db.bookings
    .filter((b) => b.tutorId === tutorId && b.status !== "Cancelled")
    .forEach((b) => {
      const label = monthLabel(b.startAt);
      if (label in monthMap) monthMap[label] = (monthMap[label] ?? 0) + 1;
    });
  const monthlySessions = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

  // ── Rating trend (last 5 reviews) ─────────────────────────────────────────
  const profile = db.tutors.find((t) => t.id === tutorId);
  const reviews = db.reviews
    .filter((r) => r.tutorId === tutorId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-8);
  const ratingTrend = reviews.map((r) => ({
    date: new Date(r.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    rating: r.rating,
  }));

  // ── KPI summary ───────────────────────────────────────────────────────────
  const totalEarnings = completed.reduce((s, b) => s + b.baseAmount * 0.9, 0);
  const totalSessions = db.bookings.filter((b) => b.tutorId === tutorId).length;
  const cancelledCount = db.bookings.filter((b) => b.tutorId === tutorId && b.status === "Cancelled").length;
  const completionRate = totalSessions > 0 ? Math.round(((totalSessions - cancelledCount) / totalSessions) * 100) : 0;

  return {
    status: 200,
    data: {
      ok: true,
      summary: {
        totalEarnings: Math.round(totalEarnings),
        totalSessions,
        completedSessions: completed.length,
        completionRate,
        ratingAvg: profile?.ratingAvg ?? 0,
        reviewCount: profile?.reviewCount ?? 0,
      },
      weeklyEarnings,
      monthlySessions,
      ratingTrend,
    },
  };
}
