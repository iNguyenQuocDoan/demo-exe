"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Check,
  Zap,
  Star,
  Shield,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { getMySubscription, createSubscription } from "@/api/subscriptionApi";
import type { Subscription, SubscriptionBillingCycle } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const PLANS: {
  cycle: SubscriptionBillingCycle;
  label: string;
  price: number;
  days: number;
  tag?: string;
}[] = [
  { cycle: "monthly", label: "Tháng", price: 99_000, days: 30 },
  { cycle: "quarterly", label: "3 Tháng", price: 249_000, days: 90, tag: "Tiết kiệm 16%" },
];

const BENEFITS = [
  { icon: Star, text: "Tiếp cận gia sư Premium – được xác minh chất lượng cao" },
  { icon: Shield, text: "Ưu tiên hiển thị gia sư có rating 4.8+ và nhiều năm kinh nghiệm" },
  { icon: Zap, text: "Tìm kiếm không giới hạn kết quả" },
  { icon: Clock, text: "Hỗ trợ ưu tiên từ đội ngũ GiaSưHub" },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined);
  const [selected, setSelected] = useState<SubscriptionBillingCycle>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getMySubscription().then((s) => setSub(s));
  }, []);

  const isActive = sub?.status === "active" && sub.expiresAt > new Date().toISOString();

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    const result = await createSubscription(selected);
    setLoading(false);
    if (result.ok && result.subscription) {
      setSub(result.subscription);
      setSuccess(true);
    } else {
      setError(result.error ?? "Có lỗi xảy ra.");
    }
  };

  if (sub === undefined) {
    return (
      <main className="min-h-dvh bg-(--bg-app) flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />
      <section className="pt-4 pb-12">
        <div className="site-container max-w-2xl space-y-6">

          {/* Header */}
          <div className="text-center space-y-2 py-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 shadow-lg mx-auto">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">GiaSưHub Premium</h1>
            <p className="text-muted-foreground">
              Mở khóa truy cập gia sư chất lượng cao, được xác minh kỹ lưỡng
            </p>
          </div>

          {/* Active subscription banner */}
          {isActive && (
            <div className="surface-card border-2 border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-foreground">Bạn đang dùng Premium</span>
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-400/40 text-xs">
                  Đang hoạt động
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Hết hạn:{" "}
                <span className="font-medium text-foreground">
                  {format(new Date(sub!.expiresAt), "dd/MM/yyyy", { locale: vi })}
                </span>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 mt-1"
                onClick={() => router.push("/tutors")}
              >
                Khám phá gia sư Premium <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Success state */}
          {success && !isActive && (
            <div className="surface-card border border-success/30 bg-success/5 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="font-semibold text-foreground">Đăng ký thành công!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bạn đã mở khóa GiaSưHub Premium. Bắt đầu tìm kiếm gia sư ngay.
              </p>
              <Button size="sm" onClick={() => router.push("/tutors")} className="gap-1.5">
                Tìm gia sư Premium <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Benefits */}
          <div className="surface-card p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Quyền lợi Premium</h2>
            <div className="space-y-3">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-400/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan selection */}
          {!isActive && !success && (
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground">Chọn gói</h2>
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.cycle}
                    type="button"
                    onClick={() => setSelected(plan.cycle)}
                    className={`surface-card p-4 rounded-2xl text-left transition-all space-y-1 border-2 ${
                      selected === plan.cycle
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{plan.label}</span>
                      {plan.tag && (
                        <Badge className="text-xs bg-success/20 text-success border-success/30">
                          {plan.tag}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {formatCurrency(plan.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(Math.round(plan.price / plan.days))}/ngày
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-12 text-base font-semibold"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                {loading ? "Đang xử lý..." : "Đăng ký Premium"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Thanh toán từ ví GiaSưHub. Không tự động gia hạn.
              </p>
            </div>
          )}

          {/* Renew if already active */}
          {isActive && (
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground">Gia hạn sớm</h2>
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.cycle}
                    type="button"
                    onClick={() => setSelected(plan.cycle)}
                    className={`surface-card p-4 rounded-2xl text-left border-2 space-y-1 transition-all ${
                      selected === plan.cycle
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{plan.label}</span>
                      {plan.tag && (
                        <Badge className="text-xs bg-success/20 text-success border-success/30">
                          {plan.tag}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {formatCurrency(plan.price)}
                    </div>
                  </button>
                ))}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                variant="outline"
                className="w-full gap-2 h-11"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4 text-amber-500" />}
                {loading ? "Đang xử lý..." : "Gia hạn Premium"}
              </Button>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
