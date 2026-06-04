"use client";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2, XCircle, CreditCard, Wallet,
  AlertCircle, Clock, User, Building2, Search, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getDepositRequests, getWithdrawRequests,
  approveDeposit, rejectDeposit, processWithdraw,
} from "@/api/walletApi";
import { getUserNameMap } from "@/api/referenceApi";
import type { DepositRequest, WithdrawRequest, TransactionStatus } from "@/types";

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản",
  MOMO: "MoMo",
  VNPAY: "VNPay",
  ZALOPAY: "ZaloPay",
  CASH: "Tiền mặt",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "warning" | "success" | "destructive" }> = {
  Pending:   { label: "Chờ xử lý",  variant: "warning" },
  Completed: { label: "Hoàn thành", variant: "success" },
  Failed:    { label: "Thất bại",   variant: "destructive" },
  Cancelled: { label: "Đã hủy",    variant: "destructive" },
  Rejected:  { label: "Từ chối",    variant: "destructive" },
};

function AdminNote({ onConfirm, onCancel, label, loading }: {
  onConfirm: (note: string) => void;
  onCancel: () => void;
  label: string;
  loading?: boolean;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú (tùy chọn)..."
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
      />
      <div className="flex gap-2">
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onConfirm(note)} loading={loading} disabled={loading}>
          <CheckCircle2 className="h-3 w-3" /> {label}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
      </div>
    </div>
  );
}

function DepositRow({ deposit, userNameMap, onApprove, onReject }: {
  deposit: DepositRequest;
  userNameMap: Record<string, string>;
  onApprove: (id: string, note: string) => Promise<void>;
  onReject:  (id: string, note: string) => Promise<void>;
}) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [busy, setBusy] = useState(false);
  const { label, variant } = STATUS_CONFIG[deposit.status] ?? { label: deposit.status, variant: "default" };
  const date = new Date(deposit.createdAt).toLocaleString("vi-VN");

  const handle = async (fn: (id: string, note: string) => Promise<void>, note: string) => {
    setBusy(true);
    try { await fn(deposit.id, note); } finally { setBusy(false); setAction(null); }
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-sm text-foreground">
                {userNameMap[deposit.userId] ?? deposit.userId}
              </span>
            </div>
            <Badge variant={variant} className="text-xs">{label}</Badge>
            <Badge variant="outline" className="text-xs">{METHOD_LABELS[deposit.paymentMethod] ?? deposit.paymentMethod}</Badge>
          </div>
          <div className="text-lg font-bold text-foreground">
            +{deposit.amount.toLocaleString("vi-VN")} VND
          </div>
          {deposit.bankTransferInfo && (
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {deposit.bankTransferInfo.bankName} · {deposit.bankTransferInfo.accountNumber}
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Mã GD: <strong>{deposit.bankTransferInfo.transferCode}</strong>
                · {deposit.bankTransferInfo.transferDate}
              </div>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {date}
          </div>
          {deposit.approvedBy && (
            <div className="text-xs text-success">
              Đã duyệt bởi {deposit.approvedBy} vào {deposit.approvedAt ? new Date(deposit.approvedAt).toLocaleString("vi-VN") : ""}
            </div>
          )}
          {deposit.rejectedReason && (
            <div className="text-xs text-destructive">Lý do từ chối: {deposit.rejectedReason}</div>
          )}
        </div>

        {deposit.status === "Pending" && !action && (
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" className="gap-1" onClick={() => setAction("approve")} disabled={busy}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Duyệt
            </Button>
            <Button size="sm" variant="destructive" className="gap-1" onClick={() => setAction("reject")} disabled={busy}>
              <XCircle className="h-3.5 w-3.5" /> Từ chối
            </Button>
          </div>
        )}
      </div>
      {action === "approve" && (
        <AdminNote label="Xác nhận duyệt" loading={busy} onConfirm={(note) => handle(onApprove, note)} onCancel={() => setAction(null)} />
      )}
      {action === "reject" && (
        <AdminNote label="Xác nhận từ chối" loading={busy} onConfirm={(note) => handle(onReject, note)} onCancel={() => setAction(null)} />
      )}
    </div>
  );
}

function WithdrawRow({ withdraw, userNameMap, onApprove, onReject }: {
  withdraw: WithdrawRequest;
  userNameMap: Record<string, string>;
  onApprove: (id: string, note: string) => Promise<void>;
  onReject:  (id: string, note: string) => Promise<void>;
}) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [busy, setBusy] = useState(false);
  const { label, variant } = STATUS_CONFIG[withdraw.status] ?? { label: withdraw.status, variant: "default" };
  const date = new Date(withdraw.createdAt).toLocaleString("vi-VN");

  const handle = async (fn: (id: string, note: string) => Promise<void>, note: string) => {
    setBusy(true);
    try { await fn(withdraw.id, note); } finally { setBusy(false); setAction(null); }
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-sm text-foreground">
                {userNameMap[withdraw.userId] ?? withdraw.userId}
              </span>
            </div>
            <Badge variant={variant} className="text-xs">{label}</Badge>
            <Badge variant="outline" className="text-xs">Rút tiền</Badge>
          </div>
          <div className="text-lg font-bold text-foreground">
            -{withdraw.amount.toLocaleString("vi-VN")} VND
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {withdraw.bankInfo.bankName} · {withdraw.bankInfo.accountNumber}
            </div>
            <div>Chủ tài khoản: <strong>{withdraw.bankInfo.accountName}</strong></div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {date}
          </div>
          {withdraw.processedBy && (
            <div className="text-xs text-success">
              Đã xử lý bởi {withdraw.processedBy} vào {withdraw.processedAt ? new Date(withdraw.processedAt).toLocaleString("vi-VN") : ""}
            </div>
          )}
          {withdraw.rejectedReason && (
            <div className="text-xs text-destructive">Lý do: {withdraw.rejectedReason}</div>
          )}
        </div>

        {withdraw.status === "Pending" && !action && (
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" className="gap-1" onClick={() => setAction("approve")} disabled={busy}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Xử lý
            </Button>
            <Button size="sm" variant="destructive" className="gap-1" onClick={() => setAction("reject")} disabled={busy}>
              <XCircle className="h-3.5 w-3.5" /> Từ chối
            </Button>
          </div>
        )}
      </div>
      {action === "approve" && (
        <AdminNote label="Xác nhận chuyển tiền" loading={busy} onConfirm={(note) => handle(onApprove, note)} onCancel={() => setAction(null)} />
      )}
      {action === "reject" && (
        <AdminNote label="Xác nhận từ chối" loading={busy} onConfirm={(note) => handle(onReject, note)} onCancel={() => setAction(null)} />
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const { user, isLoading } = useAuthStore();
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deps, withs] = await Promise.all([
        getDepositRequests(),
        getWithdrawRequests(),
      ]);
      setDeposits(deps);
      setWithdrawals(withs);
      const allUserIds = Array.from(new Set([...deps.map((d) => d.userId), ...withs.map((w) => w.userId)]));
      // Names resolved by the BE (withdraw/pending) take precedence over the lookup map.
      const embedded: Record<string, string> = {};
      for (const w of withs) if (w.userName) embedded[w.userId] = w.userName;
      const resolved = allUserIds.length > 0 ? await getUserNameMap(allUserIds) : {};
      setUserNameMap({ ...resolved, ...embedded });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadData();
  }, [isLoading, loadData, user]);

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app) pt-4 pb-8">
        <div className="site-container space-y-4">
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </main>
    );
  }


  const handleApproveDeposit = async (id: string, _note: string) => {
    await approveDeposit(id, user?.id ?? "");
    await loadData();
  };

  const handleRejectDeposit = async (id: string, note: string) => {
    await rejectDeposit(id, user?.id ?? "", note || "Admin từ chối");
    await loadData();
  };

  const handleApproveWithdraw = async (id: string, _note: string) => {
    await processWithdraw(id, user?.id ?? "", true);
    await loadData();
  };

  const handleRejectWithdraw = async (id: string, note: string) => {
    await processWithdraw(id, user?.id ?? "", false, note || "Admin từ chối");
    await loadData();
  };

  const pendingDeposits  = deposits.filter((d) => d.status === "Pending").length;
  const pendingWithdraws = withdrawals.filter((w) => w.status === "Pending").length;

  const filterItems = <T extends { userId: string; status: TransactionStatus }>(items: T[]) =>
    items.filter((item) => {
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const name = (userNameMap[item.userId] ?? item.userId).toLowerCase();
      return matchStatus && (!search || name.includes(search.toLowerCase()));
    });

  return (
    <main className="min-h-dvh bg-(--bg-app) pt-4 pb-8">
      <div className="site-container space-y-5">

        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý thanh toán</h1>
          <p className="text-sm text-muted-foreground">Duyệt yêu cầu nạp / rút tiền</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Chờ duyệt nạp", value: pendingDeposits,  icon: CreditCard, urgent: pendingDeposits > 0 },
            { label: "Chờ xử lý rút", value: pendingWithdraws, icon: Wallet,     urgent: pendingWithdraws > 0 },
            { label: "Đã duyệt",       value: deposits.filter((d) => d.status === "Completed").length, icon: CheckCircle2, urgent: false },
            { label: "Đã từ chối",     value: deposits.filter((d) => d.status === "Failed").length + withdrawals.filter((w) => w.status === "Failed").length, icon: XCircle, urgent: false },
          ].map(({ label, value, icon: Icon, urgent }) => (
            <Card key={label} className={urgent && value > 0 ? "border-amber-300" : ""}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-1 ${urgent && value > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
                <div className={`text-2xl font-bold ${urgent && value > 0 ? "text-amber-700" : "text-foreground"}`}>{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="surface-card p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên người dùng..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "Pending", "Completed", "Failed"] as const).map((s) => (
              <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="text-xs h-8">
                {s === "all" ? "Tất cả" : s === "Pending" ? "Chờ xử lý" : s === "Completed" ? "Hoàn thành" : "Thất bại"}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="deposits">
          <TabsList className="w-full">
            <TabsTrigger value="deposits" className="flex-1">
              Nạp tiền
              {pendingDeposits > 0 && (
                <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 leading-none">{pendingDeposits}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1">
              Rút tiền
              {pendingWithdraws > 0 && (
                <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 leading-none">{pendingWithdraws}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposits" className="mt-4 space-y-3">
            {filterItems(deposits).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Không có giao dịch nào</p>
              </div>
            ) : filterItems(deposits).map((d) => (
              <DepositRow key={d.id} deposit={d} userNameMap={userNameMap} onApprove={handleApproveDeposit} onReject={handleRejectDeposit} />
            ))}
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4 space-y-3">
            {filterItems(withdrawals).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Không có giao dịch nào</p>
              </div>
            ) : filterItems(withdrawals).map((w) => (
              <WithdrawRow key={w.id} withdraw={w} userNameMap={userNameMap} onApprove={handleApproveWithdraw} onReject={handleRejectWithdraw} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
