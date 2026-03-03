"use client";
import { useCallback, useEffect, useState } from "react";
import { ParentWallet } from "@/components/parent/ParentWallet";
import { useAuthStore } from "@/store/useAuthStore";
import { getWallet, getTransactions, createDepositRequest, createWithdrawRequest } from "@/api/walletApi";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction, PaymentMethod } from "@/types";

export default function ParentWalletPage() {
  const { user, isLoading } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [wallet, txns] = await Promise.all([
        getWallet(),
        getTransactions(),
      ]);
      setBalance(wallet.balance);
      setTransactions(txns);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadData();
  }, [isLoading, loadData, user]);

  const handleDeposit = async (amount: number, method: PaymentMethod) => {
    if (!user) return;
    await createDepositRequest({ userId: user.id, amount, paymentMethod: method });
    await loadData();
  };

  const handleWithdraw = async (amount: number, bankInfo: { bankName: string; accountNumber: string; accountName: string }) => {
    if (!user) return;
    const result = await createWithdrawRequest({ userId: user.id, amount, bankInfo });
    if (result.ok) {
      await loadData();
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

      <ParentWallet
        userId={user?.id ?? ""}
        balance={balance}
        transactions={transactions}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
}
