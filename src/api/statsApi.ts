import { apiClient } from "@/lib/apiClient";

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
  };
  /** System-level financial snapshot (computed server/mock side) */
  system?: {
    platformRevenue: number;
    activeHoldAmount: number;
    totalWalletBalance: number;
    pendingDepositAmount: number;
    pendingWithdrawalAmount: number;
  };
  /** Top tutors by booking count and by rating */
  topTutors?: {
    byBookings: Array<{ tutorId: string; name: string; avatarUrl?: string; bookingCount: number; ratingAvg: number }>;
    byRating: Array<{ tutorId: string; name: string; avatarUrl?: string; ratingAvg: number; reviewCount: number }>;
  };
}

export interface GetDashboardStatsParams {
  startDate?: string;
  endDate?: string;
}

export async function getDashboardStats(
  params?: GetDashboardStatsParams,
): Promise<DashboardStats> {
  const { data } = await apiClient.get<{ ok: boolean; data: DashboardStats }>(
    "/stats/dashboard",
    { params },
  );
  return data.data;
}
