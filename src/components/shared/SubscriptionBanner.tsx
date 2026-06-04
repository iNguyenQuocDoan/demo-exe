"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMySubscription } from "@/api/subscriptionApi";
import type { Subscription } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function SubscriptionBanner() {
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    getMySubscription().then(setSub);
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (sub === undefined) return null;

  // Active subscription
  if (sub) {
    const expiresAt = new Date(sub.expiresAt);
    const daysLeft = now === null ? null : Math.ceil((expiresAt.getTime() - now) / 86_400_000);
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow-sm">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-800 dark:text-amber-300">Premium đang hoạt động</span>
              <Badge className="bg-amber-500 text-white border-0 text-xs">ACTIVE</Badge>
            </div>
            <p className="text-sm text-amber-700/70 dark:text-amber-400/70">
              Còn <span className="font-medium text-amber-700 dark:text-amber-400">{daysLeft ?? "..."} ngày</span> · Hết hạn{" "}
              {format(expiresAt, "dd/MM/yyyy", { locale: vi })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <CheckCircle2 className="h-4 w-4" />
          <span className="hidden sm:inline">Toàn quyền truy cập gia sư Premium</span>
        </div>
      </div>
    );
  }

  // No subscription — CTA
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Nâng cấp lên Premium</p>
          <p className="text-sm text-muted-foreground">Tiếp cận gia sư chất lượng cao, ưu tiên tìm kiếm</p>
        </div>
      </div>
      <Link href="/parent/subscription">
        <Button size="sm" className="shrink-0 gap-1.5 shadow-sm shadow-primary/20">
          <Crown className="h-4 w-4" />
          Xem gói Premium
        </Button>
      </Link>
    </div>
  );
}
