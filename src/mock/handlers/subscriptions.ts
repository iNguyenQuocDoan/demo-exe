import { db } from "../db";
import { nanoid } from "nanoid";
import type { SubscriptionBillingCycle } from "@/types";

function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const u = JSON.parse(localStorage.getItem("auth_user") ?? "null") as { id: string } | null;
    return u?.id ?? null;
  } catch { return null; }
}

export function handleGetMySubscription() {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };

  const now = new Date().toISOString();
  const sub = db.subscriptions.find(
    (s) => s.userId === userId && s.status === "active" && s.expiresAt > now,
  ) ?? null;
  return { status: 200, data: { ok: true, subscription: sub } };
}

const PLAN_PRICES: Record<SubscriptionBillingCycle, number> = {
  monthly: 99_000,
  quarterly: 249_000,
};
const PLAN_DAYS: Record<SubscriptionBillingCycle, number> = {
  monthly: 30,
  quarterly: 90,
};

export function handleCreateSubscription(body: { billingCycle: SubscriptionBillingCycle }) {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };

  const { billingCycle } = body;
  if (!billingCycle || !PLAN_PRICES[billingCycle])
    return { status: 400, data: { ok: false, error: "Invalid billing cycle" } };

  const amount = PLAN_PRICES[billingCycle];
  const wallet = db.wallets.find((w) => w.userId === userId);
  if (!wallet || wallet.balance < amount)
    return { status: 400, data: { ok: false, error: "Số dư ví không đủ" } };

  // Cancel any existing active subscription
  const now = new Date().toISOString();
  db.subscriptions.forEach((s) => {
    if (s.userId === userId && s.status === "active") s.status = "cancelled";
  });

  // Deduct wallet
  const prev = wallet.balance;
  wallet.balance -= amount;
  db.saveWallets();

  // Record transaction
  db.transactions.unshift({
    id: nanoid(),
    walletId: wallet.id,
    userId,
    type: "SUBSCRIPTION_FEE" as never,
    amount: -amount,
    balanceBefore: prev,
    balanceAfter: wallet.balance,
    status: "Completed",
    description: `Đăng ký Premium ${billingCycle === "monthly" ? "tháng" : "quý"}`,
    createdAt: now,
    completedAt: now,
  });
  db.saveTransactions();

  // Create subscription
  const expiresAt = new Date(
    Date.now() + PLAN_DAYS[billingCycle] * 24 * 60 * 60 * 1000,
  ).toISOString();

  const sub = {
    id: nanoid(),
    userId,
    billingCycle,
    status: "active" as const,
    amount,
    startAt: now,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };
  db.subscriptions.unshift(sub);
  db.saveSubscriptions();

  return { status: 201, data: { ok: true, subscription: sub } };
}
