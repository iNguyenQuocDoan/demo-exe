import { apiClient } from "@/lib/apiClient";
import type { Subscription, SubscriptionBillingCycle } from "@/types";

export async function getMySubscription(): Promise<Subscription | null> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; subscription: Subscription | null }>(
      "/subscriptions/me",
    );
    return data.subscription ?? null;
  } catch {
    return null;
  }
}

export async function createSubscription(
  billingCycle: SubscriptionBillingCycle,
): Promise<{ ok: boolean; subscription?: Subscription; error?: string }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean; subscription: Subscription; error?: string }>(
      "/subscriptions",
      { billingCycle },
    );
    return data;
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
    return { ok: false, error: msg ?? "Không thể đăng ký gói Premium." };
  }
}
