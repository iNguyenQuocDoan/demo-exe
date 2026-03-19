"use client";

import Link from "next/link";
import { FileText, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function TutorCandidateDashboardPage() {
  useAuthStore();

  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <section className="section-space-tight">
        <div className="site-container max-w-3xl">
          <div className="surface-card p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-foreground">Dashboard ứng viên gia sư</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi trạng thái hồ sơ, đọc ghi chú admin và cập nhật lại khi được yêu cầu.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button asChild className="gap-2">
                <Link href="/tutor-application">
                  <FileText className="h-4 w-4" />
                  Xem trạng thái hồ sơ
                </Link>
              </Button>

              <Button asChild variant="outline" className="gap-2">
                <Link href="/apply-tutor?resubmit=true">
                  <RefreshCcw className="h-4 w-4" />
                  Cập nhật hồ sơ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
