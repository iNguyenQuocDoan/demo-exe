"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save, Settings } from "lucide-react";
import { getFeeConfig, updateFeeConfig } from "@/api/referenceApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import type { FeeConfig } from "@/types";

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<FeeConfig>({
    feeType: "PERCENT",
    feeValue: 10,
    whoPays: "PARENT",
    appliesToTrial: false,
  });

  useEffect(() => {
    if (isLoading || !user) return;

    let mounted = true;
    setLoading(true);
    void getFeeConfig(true)
      .then((data) => {
        if (!mounted) return;
        setConfig({ ...data, appliesToTrial: false });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isLoading, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFeeConfig({ ...config, appliesToTrial: false });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-[var(--bg-app)]">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }


  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container max-w-3xl space-y-5">
          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Cài đặt hệ thống</h1>
                <p className="text-sm text-muted-foreground">Quản lý fee config và thông số vận hành cơ bản.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin">Quay lại dashboard</Link>
              </Button>
            </div>
          </header>

          <section className="surface-card p-5 sm:p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Settings className="h-4 w-4 text-primary" />
              Fee configuration
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Fee type</span>
                <select
                  value={config.feeType}
                  onChange={(e) => setConfig((prev) => ({ ...prev, feeType: e.target.value as FeeConfig["feeType"] }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="PERCENT">PERCENT</option>
                  <option value="FIXED">FIXED</option>
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Fee value</span>
                <Input
                  type="number"
                  min={0}
                  value={config.feeValue}
                  onChange={(e) => setConfig((prev) => ({ ...prev, feeValue: Number(e.target.value || 0) }))}
                />
              </label>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Hệ thống đã tắt buổi học thử. Tất cả booking mới đều là buổi học trả phí và <strong>whoPays = PARENT</strong>.
            </div>

            <Button className="gap-2" onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              Lưu cài đặt
            </Button>
          </section>
        </div>
      </section>
    </main>
  );
}
