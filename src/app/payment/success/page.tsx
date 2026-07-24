"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Home, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/icon";
import { useAuthStore } from "@/store/useAuthStore";
import { getWallet, getTransactions } from "@/api/walletApi";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const walletPath = user?.role === "tutor" ? "/tutor/wallet" : "/parent/wallet";

  useEffect(() => {
    // Gọi API để kích hoạt load đồng bộ backend và cập nhật số dư thực tế
    if (user) {
      void Promise.all([
        getWallet().catch(() => null),
        getTransactions().catch(() => null),
      ]);
    }
  }, [user]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-(--bg-app)">
      <Card className="w-full max-w-md border border-border shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <AppIcon icon={CheckCircle2} size="empty" tone="success" className="mx-auto" />
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Thanh toán thành công</h1>
            <p className="text-sm text-muted-foreground">
              Giao dịch nạp tiền của bạn đang được hệ thống xử lý. Số dư ví sẽ được cập nhật sau khi PayOS xác nhận.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full"
              onClick={() => router.replace(`${walletPath}?deposit=success`)}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Về ví của tôi
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.replace("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
