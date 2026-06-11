"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpCircle,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getWallet, getTransactions, createWithdrawRequest } from "@/api/walletApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TRANSACTION_TYPE_META, TRANSACTION_STATUS_META, txDisplay } from "@/lib/statusMeta";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import type { Transaction } from "@/types";

export default function TutorWalletPage() {
  const { user, isLoading } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [bankInfo, setBankInfo] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [submitting, setSubmitting] = useState(false);
  const [txTypeFilter, setTxTypeFilter] = useState<"all" | "credit" | "debit">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [wallet, txns] = await Promise.all([getWallet(), getTransactions()]);
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

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error("Số tiền rút phải lớn hơn 0 VNĐ");
      return;
    }
    if (withdrawAmount > balance) {
      toast.error("Số dư khả dụng không đủ!");
      return;
    }
    if (!bankInfo.bankName.trim() || !bankInfo.accountNumber.trim() || !bankInfo.accountName.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin ngân hàng!");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createWithdrawRequest({
        amount: Number(withdrawAmount),
        bankName: bankInfo.bankName.trim(),
        bankAccountNumber: bankInfo.accountNumber.trim(),
        bankAccountName: bankInfo.accountName.trim().toUpperCase(),
      });
      if (result.ok) {
        toast.success("Đã gửi yêu cầu rút tiền. Vui lòng chờ admin xử lý.");
        setShowWithdraw(false);
        setWithdrawAmount(0);
        setBankInfo({ bankName: "", accountNumber: "", accountName: "" });
        await loadData();
      } else {
        toast.error(result.error ?? "Không thể gửi yêu cầu rút tiền.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalEarned = transactions
    .filter((tx) => tx.type === "TUTOR_PAYOUT" && tx.status === "Completed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const filteredTransactions = useMemo(() => {
    if (txTypeFilter === "all") return transactions;
    return transactions.filter((tx) => {
      const isCredit = TRANSACTION_TYPE_META[tx.type]?.direction === "credit";
      return txTypeFilter === "credit" ? isCredit : !isCredit;
    });
  }, [transactions, txTypeFilter]);

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container max-w-3xl space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container max-w-3xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Ví thu nhập</h1>
          </div>

          {/* Balance card */}
          <Card className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Số dư khả dụng</h3>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">VNĐ</Badge>
              </div>
              <div className="text-4xl font-bold mb-2">
                {balance.toLocaleString("vi-VN")}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/70 mb-6">
                <TrendingUp className="h-3.5 w-3.5" />
                Tổng thu nhập: {totalEarned.toLocaleString("vi-VN")} VNĐ
              </div>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setShowWithdraw(true)}
                disabled={balance < 50000}
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Rút tiền
              </Button>
            </CardContent>
          </Card>

          {/* Withdraw form */}
          {showWithdraw && (
            <Card>
              <CardHeader>
                <CardTitle>Yêu cầu rút tiền</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Số tiền rút (VNĐ)</label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    min={50000}
                    max={balance}
                    step={10000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Số dư khả dụng: {balance.toLocaleString("vi-VN")} VNĐ · Tối thiểu 50,000 VNĐ
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tên ngân hàng</label>
                  <Input
                    value={bankInfo.bankName}
                    onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                    placeholder="Vietcombank, Techcombank..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Số tài khoản</label>
                  <Input
                    value={bankInfo.accountNumber}
                    onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tên chủ tài khoản</label>
                  <Input
                    value={bankInfo.accountName}
                    onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value.toUpperCase() })}
                    placeholder="NGUYEN VAN A"
                  />
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  Thời gian xử lý: 1–3 ngày làm việc · Phí rút: miễn phí
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleWithdraw} disabled={submitting} className="flex-1">
                    {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowWithdraw(false)}>Hủy</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction history */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Lịch sử giao dịch
                </CardTitle>
                <div className="flex gap-1.5">
                  {(["all", "credit", "debit"] as const).map((f) => (
                    <Button
                      key={f}
                      size="sm"
                      variant={txTypeFilter === f ? "default" : "outline"}
                      className="h-7 text-xs px-2.5"
                      onClick={() => setTxTypeFilter(f)}
                    >
                      {f === "all" ? "Tất cả" : f === "credit" ? "Thu" : "Chi"}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((tx, i) => {
                    const typeMeta = TRANSACTION_TYPE_META[tx.type];
                    const Icon = typeMeta?.icon ?? Wallet;
                    const amt = txDisplay(tx.type, tx.amount);
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${amt.colorClass}`} />
                          <div>
                            <p className="text-sm font-medium">{typeMeta?.label ?? tx.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className={`text-sm font-semibold ${amt.colorClass}`}>
                            {amt.sign}{amt.value.toLocaleString("vi-VN")} VNĐ
                          </p>
                          <StatusBadge registry={TRANSACTION_STATUS_META} value={tx.status} showIcon={false} className="text-xs" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
