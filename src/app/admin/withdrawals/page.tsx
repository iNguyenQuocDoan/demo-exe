"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Mail,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { getPendingWithdrawRequests, processWithdrawRequest } from "@/api/walletApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import type { WithdrawRequest } from "@/types";

export default function AdminWithdrawalsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // States cho modal duyệt / từ chối
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async (p: number, size: number) => {
    setLoading(true);
    try {
      const res = await getPendingWithdrawRequests(p, size);
      setRequests(res.data);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách yêu cầu rút tiền.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    void loadData(page, pageSize);
  }, [authLoading, user, page, pageSize, loadData]);

  const openApproveModal = (req: WithdrawRequest) => {
    setSelectedRequest(req);
    setActionType("approve");
    setAdminNote("Đã duyệt yêu cầu rút tiền và xử lý chuyển khoản.");
  };

  const openRejectModal = (req: WithdrawRequest) => {
    setSelectedRequest(req);
    setActionType("reject");
    setAdminNote("");
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setAdminNote("");
  };

  const handleProcess = async () => {
    if (!selectedRequest || !actionType) return;

    const isApprove = actionType === "approve";
    
    if (!isApprove && !adminNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await processWithdrawRequest(selectedRequest.id, {
        approve: isApprove,
        adminNote: adminNote.trim(),
      });

      if (res.ok) {
        toast.success(isApprove ? "Đã duyệt yêu cầu rút tiền." : "Đã từ chối yêu cầu rút tiền.");
        closeModal();
        // Reset về trang 1 hoặc reload trang hiện tại
        void loadData(page, pageSize);
      } else {
        toast.error(res.error ?? "Không thể xử lý yêu cầu.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app) pt-4 pb-8">
        <div className="site-container space-y-4 max-w-5xl">
          <div className="h-8 bg-muted rounded w-64 animate-pulse" />
          <div className="h-4 bg-muted rounded w-96 animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--bg-app) pt-4 pb-8">
      <div className="site-container space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Yêu cầu rút tiền chờ duyệt</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quản lý và xử lý các yêu cầu rút tiền từ ví của Phụ huynh và Gia sư.
            </p>
          </div>
          <Badge variant="warning" className="text-sm px-3 py-1 font-semibold rounded-full">
            {totalElements} Yêu cầu chờ xử lý
          </Badge>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Wallet className="h-14 w-14 mb-4 opacity-30 text-primary animate-bounce" />
              <p className="text-base font-medium">Không có yêu cầu rút tiền nào đang chờ duyệt</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Hệ thống sẽ tự động cập nhật khi có yêu cầu mới.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {requests.map((req) => {
                const reqDate = new Date(req.createdAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                return (
                  <Card key={req.id} className="border border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                        <div className="space-y-3 flex-1">
                          {/* User info */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <User className="h-4 w-4 text-primary" />
                              <span>{req.userName || "Người dùng ẩn danh"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{req.userEmail || "Không có email"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Yêu cầu lúc: {reqDate}</span>
                            </div>
                          </div>

                          {/* Bank details & Amount */}
                          <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-border/40">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Thông tin tài khoản</div>
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{req.bankInfo.bankName}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                STK: <strong className="text-foreground">{req.bankInfo.accountNumber}</strong>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Chủ TK: <strong className="text-foreground">{req.bankInfo.accountName}</strong>
                              </div>
                            </div>
                            
                            <div className="sm:text-right flex flex-col sm:justify-center">
                              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Số tiền rút</div>
                              <div className="text-xl font-black text-red-600">
                                -{req.amount.toLocaleString("vi-VN")} VNĐ
                              </div>
                              <div className="mt-1">
                                <Badge variant="warning" className="text-[10px] uppercase font-bold py-0">PENDING</Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 shrink-0 md:justify-center md:items-end">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-1 flex-1 md:w-28"
                            onClick={() => openApproveModal(req)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1 flex-1 md:w-28"
                            onClick={() => openRejectModal(req)}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Từ chối
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded border border-border px-2 py-1 bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={5}>5 dòng</option>
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
                <span>trong tổng số {totalElements} yêu cầu</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Xử lý (Duyệt / Từ chối) */}
        {selectedRequest && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0">
            <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${actionType === "approve" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {actionType === "approve" ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {actionType === "approve" ? "Xác nhận duyệt yêu cầu" : "Từ chối yêu cầu rút tiền"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Yêu cầu của {selectedRequest.userName || "Người dùng"}
                  </p>
                </div>
              </div>

              {/* Request Info Summary */}
              <div className="bg-muted/40 border border-border/60 p-3 rounded-lg text-xs space-y-1">
                <div>Ngân hàng: <strong>{selectedRequest.bankInfo.bankName}</strong></div>
                <div>Số tài khoản: <strong>{selectedRequest.bankInfo.accountNumber}</strong></div>
                <div>Số tiền: <strong className="text-red-600">-{selectedRequest.amount.toLocaleString("vi-VN")} VNĐ</strong></div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  Ghi chú cho người dùng
                  {!actionType || actionType === "reject" ? (
                    <span className="text-xs text-red-500 font-normal">(Bắt buộc)</span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-normal">(Tùy chọn)</span>
                  )}
                </label>
                <textarea
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-20"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={actionType === "approve" ? "Ghi chú duyệt chuyển tiền..." : "Lý do từ chối (bắt buộc)..."}
                  rows={3}
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  onClick={handleProcess}
                  loading={submitting}
                  disabled={submitting}
                  className={`flex-1 ${actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}`}
                >
                  Xác nhận {actionType === "approve" ? "Duyệt" : "Từ chối"}
                </Button>
                <Button variant="outline" onClick={closeModal} disabled={submitting} className="flex-1">
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
