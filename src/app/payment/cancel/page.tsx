"use client";

import { useRouter } from "next/navigation";
import { XCircle, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/icon";
import { useAuthStore } from "@/store/useAuthStore";

export default function PaymentCancelPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const walletPath = user?.role === "tutor" ? "/tutor/wallet" : "/parent/wallet";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-(--bg-app)">
      <Card className="w-full max-w-md border border-border shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <AppIcon icon={XCircle} size="empty" tone="danger" className="mx-auto" />

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Thanh toán đã bị hủy</h1>
            <p className="text-sm text-muted-foreground">
              Bạn đã hủy giao dịch hoặc giao dịch chưa hoàn tất. Bạn chưa bị trừ tiền.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full gap-2"
              onClick={() => router.replace(`${walletPath}?deposit=open`)}
            >
              <RefreshCw className="h-4 w-4" />
              Thử nạp lại
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => router.replace(walletPath)}
            >
              <Wallet className="h-4 w-4" />
              Về ví của tôi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
