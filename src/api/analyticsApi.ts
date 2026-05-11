import { apiClient } from "@/lib/apiClient";

export interface TutorAnalyticsSummary {
  totalEarnings: number;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  ratingAvg: number;
  reviewCount: number;
}

export interface WeeklyEarning {
  week: string;
  amount: number;
}

export interface MonthlySession {
  month: string;
  count: number;
}

export interface RatingPoint {
  date: string;
  rating: number;
}

export interface TutorAnalyticsData {
  summary: TutorAnalyticsSummary;
  weeklyEarnings: WeeklyEarning[];
  monthlySessions: MonthlySession[];
  ratingTrend: RatingPoint[];
}

export async function getTutorAnalytics(): Promise<TutorAnalyticsData | null> {
  try {
    const { data } = await apiClient.get<{ ok: boolean } & TutorAnalyticsData>(
      "/stats/tutor/analytics"
    );
    return data;
  } catch {
    return null;
  }
}
