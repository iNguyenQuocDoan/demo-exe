"use client";
import React, { useState, useEffect } from "react";
import { Wallet, Plus, ArrowUpCircle, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TRANSACTION_TYPE_META, TRANSACTION_STATUS_META, txDisplay } from "@/lib/statusMeta";
import type { Transaction, PaymentMethod } from "@/types";

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface ParentWalletProps {
  userId: string;
  balance: number;
  /** Tiền đang bị giữ (escrow) cho booking chưa hoàn tất — BE `frozenBalance`. */
  frozenBalance?: number;
  transactions?: Transaction[];
  onDeposit?: (amount: number) => Promise<{ ok: boolean } | undefined>;
  onWithdraw?: (amount: number, bankInfo: BankInfo) => Promise<{ ok: boolean } | undefined>;
  defaultOpenDeposit?: boolean;
}

export function ParentWallet({ userId, balance, frozenBalance = 0, transactions = [], onDeposit, onWithdraw, defaultOpenDeposit = false }: ParentWalletProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState(100000);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [loading, setLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    if (defaultOpenDeposit) {
      setShowDeposit(true);
    }
  }, [defaultOpenDeposit]);

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (Number(depositAmount) < 2000) {
      alert("Số tiền nạp tối thiểu là 2,000 VNĐ");
      return;
    }
    if (!Number.isInteger(Number(depositAmount))) {
      alert("Số tiền nạp phải là số nguyên");
      return;
    }
    
    setDepositLoading(true);
    try {
      const res = await onDeposit?.(Number(depositAmount));
      if (res?.ok) {
        setShowDeposit(false);
        setDepositAmount(100000);
      }
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Số tiền rút phải lớn hơn 0 VNĐ");
      return;
    }
    
    if (withdrawAmount > balance) {
      alert("Số dư khả dụng không đủ!");
      return;
    }
    
    if (!bankInfo.bankName.trim() || !bankInfo.accountNumber.trim() || !bankInfo.accountName.trim()) {
      alert("Vui lòng điền đầy đủ thông tin ngân hàng!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await onWithdraw?.(withdrawAmount, {
        bankName: bankInfo.bankName.trim(),
        accountNumber: bankInfo.accountNumber.trim(),
        accountName: bankInfo.accountName.trim().toUpperCase()
      });
      if (res?.ok) {
        setShowWithdraw(false);
        setWithdrawAmount(0);
        setBankInfo({ bankName: "", accountNumber: "", accountName: "" });
      }
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Số dư khả dụng</h3>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              VNĐ
            </Badge>
          </div>

          <div className="text-4xl font-bold mb-2">
            {balance.toLocaleString("vi-VN")}
          </div>

          {frozenBalance > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-white/80 mb-6">
              <Lock className="h-3.5 w-3.5" />
              Đang giữ cho booking: {frozenBalance.toLocaleString("vi-VN")} VNĐ
            </div>
          )}
          {frozenBalance <= 0 && <div className="mb-6" />}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDeposit(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nạp tiền
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
              onClick={() => setShowWithdraw(true)}
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Rút tiền
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      {showDeposit && (
        <Card>
          <CardHeader>
            <CardTitle>Nạp tiền vào ví</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Số tiền (VNĐ)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                min={2000}
                step={10000}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmounts.map(amt => (
                  <Button
                    key={amt}
                    size="sm"
                    variant="outline"
                    onClick={() => setDepositAmount(amt)}
                  >
                    {(amt / 1000).toFixed(0)}K
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="bg-muted/40 border border-border/60 rounded-xl p-4 text-sm space-y-1">
              <p className="font-semibold text-foreground">Phương thức thanh toán:</p>
              <p className="text-xs text-muted-foreground">
                Thanh toán an toàn qua cổng **PayOS** (hỗ trợ chuyển khoản nhanh 24/7 bằng quét mã QR ngân hàng hoặc thẻ ATM nội địa).
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleDeposit} loading={depositLoading} disabled={depositLoading} className="flex-1">
                {depositLoading ? "Đang tạo link thanh toán..." : `Tiếp tục thanh toán ${Number(depositAmount).toLocaleString("vi-VN")} VNĐ`}
              </Button>
              <Button variant="outline" onClick={() => setShowDeposit(false)} disabled={depositLoading}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <Card>
          <CardHeader>
            <CardTitle>Rút tiền từ ví</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Số tiền rút (VNĐ)</label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                min={50000}
                max={balance}
                step={10000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Số dư khả dụng: {balance.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Tên ngân hàng</label>
              <Input
                value={bankInfo.bankName}
                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                placeholder="Vietcombank, Techcombank..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Số tài khoản</label>
              <Input
                value={bankInfo.accountNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                placeholder="1234567890"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Tên chủ tài khoản</label>
              <Input
                value={bankInfo.accountName}
                onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value.toUpperCase() })}
                placeholder="NGUYEN VAN A"
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <p className="font-semibold mb-1">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Thời gian xử lý: 1-3 ngày làm việc</li>
                <li>Phí rút tiền: 0 VNĐ</li>
                <li>Số tiền rút tối thiểu: 50,000 VNĐ</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleWithdraw} loading={loading} className="flex-1">
                Gửi yêu cầu rút tiền
              </Button>
              <Button variant="outline" onClick={() => setShowWithdraw(false)}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lịch sử giao dịch
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...transactions]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((tx, idx) => {
                  const typeMeta = TRANSACTION_TYPE_META[tx.type];
                  const Icon = typeMeta?.icon ?? Wallet;

                  // 1. Xác định label giao dịch theo yêu cầu
                  let label = "";
                  if (tx.type === "REFUND" || tx.amount > 0) {
                    label = tx.description || "Hoàn tiền";
                  } else if (tx.type === "DEPOSIT") {
                    label = "Nạp tiền";
                  } else if (tx.type === "BOOKING_CHARGE") { // BE PAYMENT
                    label = tx.description || "Thanh toán học phí";
                  } else if (tx.type === "WITHDRAW") {
                    label = "Rút tiền";
                  } else {
                    label = typeMeta?.label ?? tx.type;
                  }

                  // 2. Xác định dấu (+/-) và màu sắc theo loại giao dịch & giá trị tiền
                  const isPositive =
                    tx.type === "REFUND" || tx.type === "DEPOSIT" || tx.amount > 0;
                  const isNegative = tx.type === "WITHDRAW" || tx.amount < 0;

                  let sign = "";
                  let amtColorClass = "text-foreground";

                  if (isPositive) {
                    sign = "+";
                    amtColorClass = "text-green-600";
                  } else if (isNegative) {
                    sign = "-";
                    amtColorClass =
                      tx.type === "WITHDRAW" ? "text-red-600" : "text-orange-600";
                  } else {
                    sign = tx.amount > 0 ? "+" : tx.amount < 0 ? "-" : "";
                    amtColorClass =
                      tx.amount > 0
                        ? "text-green-600"
                        : tx.amount < 0
                        ? "text-orange-600"
                        : "text-foreground";
                  }

                  const displayAmt = `${sign}${Math.abs(tx.amount).toLocaleString(
                    "vi-VN"
                  )} VNĐ`;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${amtColorClass}`} />
                        <div>
                          <p className="font-medium text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <p className={`font-semibold ${amtColorClass}`}>
                          {displayAmt}
                        </p>
                        <StatusBadge
                          registry={TRANSACTION_STATUS_META}
                          value={tx.status}
                          showIcon={false}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
