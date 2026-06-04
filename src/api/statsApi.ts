import { realApiClient } from "@/lib/realApiClient";

export interface DashboardStats {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  bookings: {
    total: number;
    byStatus: Record<string, number>;
    revenue: number;
  };
  applications: {
    total: number;
    byStatus: Record<string, number>;
    pending: number;
    stuckReviewing?: number;
  };
  /** System-level financial snapshot (computed server/mock side) */
  system?: {
    platformRevenue: number;
    activeHoldAmount: number;
    totalWalletBalance: number;
    pendingDepositAmount: number;
    pendingWithdrawalAmount: number;
    pendingDepositCount?: number;
    pendingWithdrawCount?: number;
  };
  /** Open disputes snapshot */
  disputes?: {
    openCount: number;
    byReason: Record<string, number>;
  };
  /** Top tutors by booking count and by rating */
  topTutors?: {
    byBookings: Array<{ tutorId: string; name: string; avatarUrl?: string; bookingCount: number; ratingAvg: number }>;
    byRating: Array<{ tutorId: string; name: string; avatarUrl?: string; ratingAvg: number; reviewCount: number }>;
  };
}

export interface GetDashboardStatsParams {
  /** Time window for the financial chart-stats. Defaults to "month". */
  range?: "week" | "month" | "quarter" | "year" | "all";
  // Kept optional for backward-compat with older callers; not sent to BE.
  startDate?: string;
  endDate?: string;
}

// ── BE response shapes (raw maps from /api/admin/dashboard/*) ──────────────────
interface BeCardStats {
  totalUsers?: number;
  pendingProfiles?: number;
  bookingsCount?: number;
  totalRevenue?: number;
}
interface BeChartStats {
  platformRevenue?: number;
  holdingMoney?: number;
  totalWalletBalanceMock?: number;
}
interface BeTopBooked {
  tutorId: string;
  fullName: string;
  major?: string;
  hourlyRate?: number;
  rating?: number;
  totalBookings: number;
}
interface BeTopRated {
  tutorId: string;
  fullName: string;
  rating?: number;
  major?: string;
  experience?: string;
}

// BE chart-stats supports: day | 7days | month | year | all (unknown → month).
function toBeRange(range?: GetDashboardStatsParams["range"]): string {
  if (range === "week") return "7days";
  return range ?? "month"; // month/year/all pass through; quarter → BE default (month)
}

// BE booking-status keys are UPPERCASE enum names (CONFIRMED, COMPLETED, ...).
// The admin dashboard reads Title-cased keys (Confirmed, Completed, ...), so we
// expose both forms.
function normalizeStatusMap(raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = value; // raw UPPERCASE
    out[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()] = value; // Title case
  }
  return out;
}

function settled<T>(result: PromiseSettledResult<{ data: T }>, fallback: T): T {
  return result.status === "fulfilled" ? result.value.data : fallback;
}

export async function getDashboardStats(
  params?: GetDashboardStatsParams,
): Promise<DashboardStats> {
  const range = toBeRange(params?.range);

  const [cardRes, chartRes, statusRes, bookedRes, ratedRes] =
    await Promise.allSettled([
      realApiClient.get<BeCardStats>("/admin/dashboard/card-stats"),
      realApiClient.get<BeChartStats>("/admin/dashboard/chart-stats", {
        params: { range },
      }),
      realApiClient.get<Record<string, number>>("/admin/dashboard/booking-status"),
      realApiClient.get<BeTopBooked[]>("/admin/dashboard/top-booked"),
      realApiClient.get<BeTopRated[]>("/admin/dashboard/top-rated"),
    ]);

  const card = settled<BeCardStats>(cardRes, {});
  const chart = settled<BeChartStats>(chartRes, {});
  const statusMap = settled<Record<string, number>>(statusRes, {});
  const topBooked = settled<BeTopBooked[]>(bookedRes, []);
  const topRated = settled<BeTopRated[]>(ratedRes, []);

  return {
    users: {
      total: card.totalUsers ?? 0,
      byRole: {}, // BE does not break users down by role yet
    },
    bookings: {
      total: card.bookingsCount ?? 0, // bookings this month
      byStatus: normalizeStatusMap(statusMap),
      revenue: card.totalRevenue ?? 0, // completed-booking revenue this month
    },
    applications: {
      total: 0,
      byStatus: {},
      // BE proxies "applications pending" with pending tutor profiles
      pending: card.pendingProfiles ?? 0,
    },
    system: {
      platformRevenue: chart.platformRevenue ?? 0,
      activeHoldAmount: chart.holdingMoney ?? 0,
      totalWalletBalance: chart.totalWalletBalanceMock ?? 0,
      // Not tracked by the dashboard endpoints; the admin page fetches the real
      // pending deposit/withdraw lists separately.
      pendingDepositAmount: 0,
      pendingWithdrawalAmount: 0,
    },
    topTutors: {
      byBookings: topBooked.map((t) => ({
        tutorId: String(t.tutorId),
        name: t.fullName,
        bookingCount: t.totalBookings ?? 0,
        ratingAvg: t.rating ?? 0,
      })),
      byRating: topRated.map((t) => ({
        tutorId: String(t.tutorId),
        name: t.fullName,
        ratingAvg: t.rating ?? 0,
        reviewCount: 0, // top-rated endpoint does not return a review count
      })),
    },
  };
}
