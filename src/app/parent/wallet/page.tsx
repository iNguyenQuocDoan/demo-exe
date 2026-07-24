"use client";
import { useCallback, useEffect, useState } from "react";
import { ParentWallet } from "@/components/parent/ParentWallet";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getWallet,
  getTransactions,
  createWithdrawRequest,
  createPayOSPaymentLink,
} from "@/api/walletApi";
import { Skeleton } from "@/components/ui/skeleton";
import { IconButton } from "@/components/ui/icon";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/types";

export default function ParentWalletPage() {
  const { user, isLoading } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [frozenBalance, setFrozenBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositSucceeded, setDepositSucceeded] = useState(false);
  const [defaultOpenDeposit, setDefaultOpenDeposit] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [wallet, txns] = await Promise.all([
        getWallet(),
        getTransactions(),
      ]);
      setBalance(wallet.balance);
      setFrozenBalance(wallet.frozenBalance ?? 0);
      setTransactions(txns);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadData();
  }, [isLoading, loadData, user]);

  // Hiện banner khi vừa nạp tiền thành công (redirect từ /payment/vnpay-return hoặc /payment/success).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("deposit") === "success") {
      setDepositSucceeded(true);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (params.get("deposit") === "open") {
      setDefaultOpenDeposit(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleDeposit = async (amount: number): Promise<{ ok: boolean }> => {
    if (!user) return { ok: false };
    try {
      const result = await createPayOSPaymentLink(amount);
      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return { ok: true };
      } else {
        toast.error("Không nhận được link thanh toán từ PayOS.");
        return { ok: false };
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        "Không thể tạo link thanh toán PayOS.";
      toast.error(msg);
      return { ok: false };
    }
  };

  const handleWithdraw = async (
    amount: number,
    bankInfo: { bankName: string; accountNumber: string; accountName: string },
  ): Promise<{ ok: boolean }> => {
    if (!user) return { ok: false };
    const result = await createWithdrawRequest({
      amount: Number(amount),
      bankName: bankInfo.bankName.trim(),
      bankAccountNumber: bankInfo.accountNumber.trim(),
      bankAccountName: bankInfo.accountName.trim().toUpperCase(),
    });
    if (result.ok) {
      toast.success("Đã gửi yêu cầu rút tiền. Vui lòng chờ admin xử lý.");
      await loadData();
      return { ok: true };
    } else {
      toast.error(result.error ?? "Không thể gửi yêu cầu rút tiền.");
      return { ok: false };
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto pt-4 pb-8 px-4 max-w-5xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-4 pb-8 px-4 max-w-5xl">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Ví của tôi</h1>
        <p className="text-muted-foreground mt-1">Quản lý số dư và giao dịch</p>
      </div>

      {depositSucceeded && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          <span className="text-sm font-medium">
            {" "}
            Nạp tiền thành công! Số dư đã được cập nhật.
          </span>
          <IconButton
            icon={X}
            label="Đóng thông báo"
            onClick={() => setDepositSucceeded(false)}
            className="text-success hover:text-success"
          />
        </div>
      )}

      <ParentWallet
        userId={user?.id ?? ""}
        balance={balance}
        frozenBalance={frozenBalance}
        transactions={transactions}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        defaultOpenDeposit={defaultOpenDeposit}
      />
    </div>
  );
}
