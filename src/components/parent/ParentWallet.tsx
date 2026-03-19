"use client";
import React, { useState } from "react";
import { Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Transaction, TransactionType, TransactionStatus, PaymentMethod } from "@/types";

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface ParentWalletProps {
  userId: string;
  balance: number;
  transactions?: Transaction[];
  onDeposit?: (amount: number, method: PaymentMethod) => Promise<void>;
  onWithdraw?: (amount: number, bankInfo: BankInfo) => Promise<void>;
}

export function ParentWallet({ userId, balance, transactions = [], onDeposit, onWithdraw }: ParentWalletProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState(100000);
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (depositAmount < 10000) {
      alert("Số tiền nạp tối thiểu là 10,000 VNĐ");
      return;
    }
    
    setLoading(true);
    try {
      await onDeposit?.(depositAmount, depositMethod);
      setShowDeposit(false);
      setDepositAmount(100000);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount < 50000) {
      alert("Số tiền rút tối thiểu là 50,000 VNĐ");
      return;
    }
    
    if (withdrawAmount > balance) {
      alert("Số dư không đủ!");
      return;
    }
    
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
      alert("Vui lòng điền đầy đủ thông tin ngân hàng!");
      return;
    }
    
    setLoading(true);
    try {
      await onWithdraw?.(withdrawAmount, bankInfo);
      setShowWithdraw(false);
      setWithdrawAmount(0);
      setBankInfo({ bankName: "", accountNumber: "", accountName: "" });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
      case "WITHDRAW":
        return <ArrowUpCircle className="h-4 w-4 text-orange-600" />;
      case "BOOKING_HOLD":
      case "BOOKING_CHARGE":
        return <ArrowUpCircle className="h-4 w-4 text-blue-600" />;
      case "REFUND":
      case "TUTOR_PAYOUT":
        return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const variants: Record<TransactionStatus, { label: string; variant: "default" | "warning" | "success" | "destructive" }> = {
      Pending: { label: "Đang xử lý", variant: "warning" },
      Completed: { label: "Thành công", variant: "success" },
      Failed: { label: "Thất bại", variant: "destructive" },
      Cancelled: { label: "Đã hủy", variant: "default" },
    };
    const config = variants[status];
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const getTransactionLabel = (type: TransactionType): string => {
    const labels: Record<TransactionType, string> = {
      DEPOSIT: "Nạp tiền",
      WITHDRAW: "Rút tiền",
      BOOKING_HOLD: "Giữ tiền đặt lịch",
      BOOKING_CHARGE: "Thanh toán học phí",
      REFUND: "Hoàn tiền",
      TUTOR_PAYOUT: "Chi trả gia sư",
      PLATFORM_FEE: "Phí nền tảng",
    };
    return labels[type];
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Số dư ví</h3>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              VNĐ
            </Badge>
          </div>
          
          <div className="text-4xl font-bold mb-6">
            {balance.toLocaleString("vi-VN")}
          </div>
          
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
                min={10000}
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
            
            <div>
              <label className="text-sm font-medium mb-2 block">Phương thức thanh toán</label>
              <div className="space-y-2">
                {[
                  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
                  { value: "MOMO", label: "Ví MoMo" },
                  { value: "VNPAY", label: "VNPay" },
                  { value: "ZALOPAY", label: "ZaloPay" },
                ].map(method => (
                  <label key={method.value} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                    <input
                      type="radio"
                      name="depositMethod"
                      checked={depositMethod === method.value}
                      onChange={() => setDepositMethod(method.value as PaymentMethod)}
                    />
                    <span className="text-sm">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {depositMethod === "BANK_TRANSFER" && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">Thông tin chuyển khoản:</p>
                <p>Ngân hàng: <strong>Vietcombank</strong></p>
                <p>Số tài khoản: <strong>1234567890</strong></p>
                <p>Chủ tài khoản: <strong>CONG TY GIASUHUB</strong></p>
                <p className="mt-2">Nội dung: <strong className="text-primary">NAP {userId}</strong></p>
                <p className="text-xs text-muted-foreground mt-2">
                  * Sau khi chuyển khoản, vui lòng chờ 5-15 phút để hệ thống xác nhận
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleDeposit} loading={loading} className="flex-1">
                Xác nhận nạp {depositAmount.toLocaleString("vi-VN")} VNĐ
              </Button>
              <Button variant="outline" onClick={() => setShowDeposit(false)}>
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
                onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
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
              {transactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="font-medium text-sm">{getTransactionLabel(tx.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${
                      ["DEPOSIT", "REFUND"].includes(tx.type) ? "text-green-600" : "text-orange-600"
                    }`}>
                      {["DEPOSIT", "REFUND"].includes(tx.type) ? "+" : "-"}
                      {tx.amount.toLocaleString("vi-VN")} VNĐ
                    </p>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
