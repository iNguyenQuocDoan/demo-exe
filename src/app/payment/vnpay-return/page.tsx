"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Trang nhận redirect từ VNPay sau khi thanh toán (env BE: VNPAY_RETURNURL trỏ về đây).
// VNPay ký số toàn bộ tham số (vnp_SecureHash) nên ta forward NGUYÊN VĂN query string
// sang BE callback /api/wallet/vnpay-callback — BE xác thực chữ ký + cộng tiền (idempotent
// theo vnp_TxnRef). Sau đó hiển thị kết quả và đưa người dùng về ví.

type Status = "processing" | "success" | "failed";

const WALLET_PATH = "/parent/wallet";

export default function VnpayReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("processing");
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const search = window.location.search; // ?vnp_Amount=...&vnp_SecureHash=...
    const params = new URLSearchParams(search);
    const code = params.get("vnp_ResponseCode");
    const rawAmount = params.get("vnp_Amount");
    if (rawAmount) setAmount(Number(rawAmount) / 100); // VNPay nhân 100

    const isPaid = code === "00";

    // Forward sang BE để cộng tiền (qua proxy /api/be → BE Spring Boot, callback permitAll).
    const finalize = async () => {
      try {
        await fetch(`/api/be/wallet/vnpay-callback${search}`, {
          method: "GET",
          cache: "no-store",
        });
      } catch {
        // BE có thể trả 500 nếu chữ ký sai; kết quả hiển thị vẫn dựa trên vnp_ResponseCode.
      } finally {
        setStatus(isPaid ? "success" : "failed");
      }
    };

    if (search.includes("vnp_")) {
      void finalize();
    } else {
      setStatus("failed");
    }
  }, []);

  // Tự chuyển về ví sau khi nạp thành công.
  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => router.replace(`${WALLET_PATH}?deposit=success`), 2500);
    return () => clearTimeout(t);
  }, [status, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-4">
          {status === "processing" && (
            <>
              <Loader2 className="h-14 w-14 mx-auto text-primary animate-spin" />
              <h1 className="text-xl font-bold">Đang xác nhận thanh toán…</h1>
              <p className="text-muted-foreground text-sm">
                Vui lòng không đóng trang trong giây lát.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />
              <h1 className="text-xl font-bold">Nạp tiền thành công!</h1>
              {amount != null && (
                <p className="text-2xl font-bold text-green-600">
                  +{amount.toLocaleString("vi-VN")} VNĐ
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                Số dư đã được cộng vào ví của bạn. Đang chuyển về ví…
              </p>
              <Button className="w-full" onClick={() => router.replace(`${WALLET_PATH}?deposit=success`)}>
                <Wallet className="h-4 w-4 mr-2" />
                Về ví của tôi
              </Button>
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle className="h-14 w-14 mx-auto text-destructive" />
              <h1 className="text-xl font-bold">Thanh toán không thành công</h1>
              <p className="text-muted-foreground text-sm">
                Giao dịch đã bị hủy hoặc thất bại. Bạn chưa bị trừ tiền.
              </p>
              <Button variant="outline" className="w-full" onClick={() => router.replace(WALLET_PATH)}>
                <Wallet className="h-4 w-4 mr-2" />
                Quay lại ví
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
