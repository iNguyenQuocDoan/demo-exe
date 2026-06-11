/**
 * Parent Wallet Component
 * Manage wallet balance, deposits, withdrawals, and transaction history
 */
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  getWallet, 
  getTransactions,
  createDepositRequest,
  createWithdrawRequest 
} from "@/api/walletApi";
import type { Wallet, Transaction, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import {
  Wallet as WalletIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function ParentWallet() {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Deposit form
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const loadWalletData = async () => {
    setLoading(true);
    const [walletData, txns] = await Promise.all([
      getWallet(),
      getTransactions(50),
    ]);
    setWallet(walletData);
    setTransactions(txns);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      void loadWalletData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setSubmittingDeposit(true);
    const result = await createDepositRequest({
      userId: user!.id,
      amount: Number(depositAmount),
      paymentMethod: depositMethod,
    });

    if (result.ok) {
      alert("Yêu cầu nạp tiền đã được gửi! Admin sẽ xử lý trong vòng 24h.");
      setShowDepositModal(false);
      setDepositAmount("");
      await loadWalletData();
    } else {
      alert(result.error || "Có lỗi xảy ra");
    }
    setSubmittingDeposit(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      alert("Vui lòng điền đầy đủ thông tin ngân hàng");
      return;
    }

    if (wallet && Number(withdrawAmount) > wallet.balance) {
      alert("Số dư không đủ");
      return;
    }

    setSubmittingWithdraw(true);
    const result = await createWithdrawRequest({
      amount: Number(withdrawAmount),
      bankName: bankName.trim(),
      bankAccountNumber: accountNumber.trim(),
      bankAccountName: accountName.trim().toUpperCase(),
    });

    if (result.ok) {
      alert("Yêu cầu rút tiền đã được gửi! Admin sẽ xử lý trong vòng 24-48h.");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      await loadWalletData();
    } else {
      alert(result.error || "Có lỗi xảy ra");
    }
    setSubmittingWithdraw(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Đang tải ví...</div>;
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
      case "WITHDRAW":
        return <ArrowUpCircle className="h-5 w-5 text-orange-600" />;
      case "BOOKING_CHARGE":
        return <Minus className="h-5 w-5 text-red-600" />;
      case "REFUND":
        return <Plus className="h-5 w-5 text-green-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    type BadgeVariant = NonNullable<BadgeProps["variant"]>;
    const variants: Record<string, { variant: BadgeVariant; label: string }> = {
      Pending: { variant: "warning" as const, label: "Chờ xử lý" },
      Completed: { variant: "success" as const, label: "Hoàn thành" },
      Failed: { variant: "destructive" as const, label: "Thất bại" },
      Cancelled: { variant: "secondary" as const, label: "Đã hủy" },
    };
    const config = variants[status] || variants.Pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Wallet Balance Card */}
      <div className="rounded-2xl border border-border bg-linear-to-br from-primary/10 to-accent/10 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <WalletIcon className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-muted-foreground">
                Số dư ví
              </h2>
            </div>
            <p className="text-4xl font-bold text-foreground">
              {formatCurrency(wallet?.balance || 0)}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowDepositModal(true)}
              className="h-12"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nạp tiền
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawModal(true)}
              className="h-12"
            >
              <Minus className="h-5 w-5 mr-2" />
              Rút tiền
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">Lịch sử giao dịch</h2>

        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Chưa có giao dịch nào
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getTransactionIcon(txn.type)}
                  <div>
                    <p className="font-medium">{txn.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        txn.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {txn.amount > 0 ? "+" : ""}
                      {formatCurrency(txn.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Còn: {formatCurrency(txn.balanceAfter)}
                    </p>
                  </div>
                  {getStatusBadge(txn.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Nạp tiền vào ví</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Số tiền (VNĐ)
                </label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="100,000"
                  min={10000}
                  step={10000}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Phương thức thanh toán
                </label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                >
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                  <option value="MOMO">Ví Momo</option>
                  <option value="VNPAY">VNPay</option>
                  <option value="ZALOPAY">ZaloPay</option>
                </select>
              </div>

              {depositMethod === "BANK_TRANSFER" && (
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="font-semibold mb-2">Thông tin chuyển khoản:</p>
                  <p>Ngân hàng: Vietcombank</p>
                  <p>STK: 1234567890</p>
                  <p>Tên TK: CONG TY GIASU HUB</p>
                  <p className="mt-2 text-muted-foreground">
                    Nội dung: NAP {user?.id} {depositAmount}
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleDeposit}
                  loading={submittingDeposit}
                  className="flex-1"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Rút tiền về ngân hàng</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Số tiền (VNĐ)
                </label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="100,000"
                  min={10000}
                  max={wallet?.balance || 0}
                  step={10000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Số dư khả dụng: {formatCurrency(wallet?.balance || 0)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tên ngân hàng
                </label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Vietcombank"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Số tài khoản
                </label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tên chủ tài khoản
                </label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="NGUYEN VAN A"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleWithdraw}
                  loading={submittingWithdraw}
                  className="flex-1"
                >
                  Rút tiền
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
