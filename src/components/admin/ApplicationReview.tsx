"use client";
import React, { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, FileText, User, Mail, Phone, Award, DollarSign, Image, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TutorApplication, TutorApplicationStatus } from "@/types";

interface ApplicationReviewProps {
  application: TutorApplication;
  onApprove?: (adminNotes?: string) => Promise<void>;
  onReject?: (reason: string, adminNotes?: string) => Promise<void>;
  onRequestInfo?: (requestNotes: string) => Promise<void>;
  adminId: string;
}

export function ApplicationReview({ 
  application, 
  onApprove, 
  onReject, 
  onRequestInfo,
  adminId 
}: ApplicationReviewProps) {
  const [action, setAction] = useState<"approve" | "reject" | "request" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove?.(adminNotes);
      setAction(null);
      setAdminNotes("");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    
    setLoading(true);
    try {
      await onReject?.(rejectionReason, adminNotes);
      setAction(null);
      setRejectionReason("");
      setAdminNotes("");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!requestNotes.trim()) {
      alert("Vui lòng nhập thông tin cần bổ sung!");
      return;
    }
    
    setLoading(true);
    try {
      await onRequestInfo?.(requestNotes);
      setAction(null);
      setRequestNotes("");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: TutorApplicationStatus) => {
    const variants: Record<TutorApplicationStatus, { label: string; variant: "default" | "warning" | "success" | "destructive" | "secondary" }> = {
      Submitted: { label: "Chờ duyệt", variant: "warning" },
      Reviewing: { label: "Đang xem xét", variant: "default" },
      Approved: { label: "Đã duyệt", variant: "success" },
      Rejected: { label: "Đã từ chối", variant: "destructive" },
      ReSubmit: { label: "Yêu cầu bổ sung", variant: "secondary" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Hồ sơ ứng tuyển #{application.id.slice(-8)}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Nộp ngày: {new Date(application.submittedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            {getStatusBadge(application.status)}
          </div>
        </CardHeader>
        <CardContent>
          {application.resubmissionNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
              <p className="font-semibold mb-1">Ghi chú nộp lại:</p>
              <p>{application.resubmissionNotes}</p>
            </div>
          )}
          
          {application.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mb-4">
              <p className="font-semibold mb-1">Lý do từ chối:</p>
              <p>{application.rejectionReason}</p>
            </div>
          )}
          
          {application.adminNotes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p className="font-semibold mb-1">Ghi chú admin:</p>
              <p>{application.adminNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Họ tên</label>
              <p className="font-medium">{application.fullName}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {application.email}
              </p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Số điện thoại</label>
              <p className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {application.phone}
              </p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Số CCCD/ID</label>
              <p className="font-medium">{application.idCard}</p>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Học vấn & Kinh nghiệm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Trình độ</label>
              <p className="font-medium">{application.education}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Bằng cấp</label>
              <p className="font-medium">{application.degree}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Kinh nghiệm</label>
              <p className="text-sm">{application.experience}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teaching Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin giảng dạy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Môn dạy</label>
              <div className="flex flex-wrap gap-2">
                {application.subjects.map(subject => (
                  <Badge key={subject} variant="outline">{subject}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Khối lớp</label>
              <div className="flex flex-wrap gap-2">
                {application.grades.map(grade => (
                  <Badge key={grade} variant="outline">{grade}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Hình thức</label>
              <p className="font-medium">
                Trực tiếp
              </p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Học phí</label>
              <p className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {application.pricePerHour.toLocaleString("vi-VN")} VNĐ/giờ
              </p>
            </div>
          </div>
          
          {application.bio && (
            <div>
              <label className="text-xs text-muted-foreground">Giới thiệu</label>
              <p className="text-sm mt-1">{application.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Giấy tờ & Chứng chỉ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ID Card Images */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ảnh CCCD/ID</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {application.idCardImages.map((url, idx) => (
                <div 
                  key={idx} 
                  className="relative aspect-video rounded-lg border overflow-hidden cursor-pointer hover:opacity-80"
                  onClick={() => setViewingImage(url)}
                >
                  <img src={url} alt={`ID ${idx + 1}`} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Degree Images */}
          {application.degreeImages.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Ảnh bằng cấp</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {application.degreeImages.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-video rounded-lg border overflow-hidden cursor-pointer hover:opacity-80"
                    onClick={() => setViewingImage(url)}
                  >
                    <img src={url} alt={`Degree ${idx + 1}`} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Certificate Images */}
          {application.certificateImages.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Chứng chỉ khác</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {application.certificateImages.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-video rounded-lg border overflow-hidden cursor-pointer hover:opacity-80"
                    onClick={() => setViewingImage(url)}
                  >
                    <img src={url} alt={`Cert ${idx + 1}`} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {application.status === "Submitted" || application.status === "Reviewing" ? (
        <Card>
          <CardHeader>
            <CardTitle>Hành động</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!action && (
              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={() => setAction("approve")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Duyệt hồ sơ
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setAction("request")}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Yêu cầu bổ sung
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => setAction("reject")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            )}
            
            {action === "approve" && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold">Duyệt hồ sơ</h4>
                <div>
                  <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
                  <textarea
                    className="w-full min-h-24 rounded-md border border-border px-3 py-2 text-sm mt-1"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Ghi chú nội bộ..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApprove} loading={loading}>
                    Xác nhận duyệt
                  </Button>
                  <Button variant="outline" onClick={() => setAction(null)}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
            
            {action === "reject" && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold text-destructive">Từ chối hồ sơ</h4>
                <div>
                  <label className="text-sm font-medium">Lý do từ chối *</label>
                  <textarea
                    className="w-full min-h-24 rounded-md border border-border px-3 py-2 text-sm mt-1"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nêu rõ lý do từ chối..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ghi chú nội bộ (tùy chọn)</label>
                  <textarea
                    className="w-full min-h-20 rounded-md border border-border px-3 py-2 text-sm mt-1"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Ghi chú nội bộ..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleReject} loading={loading}>
                    Xác nhận từ chối
                  </Button>
                  <Button variant="outline" onClick={() => setAction(null)}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
            
            {action === "request" && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold">Yêu cầu bổ sung thông tin</h4>
                <div>
                  <label className="text-sm font-medium">Thông tin cần bổ sung *</label>
                  <textarea
                    className="w-full min-h-24 rounded-md border border-border px-3 py-2 text-sm mt-1"
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Mô tả thông tin cần bổ sung..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRequestInfo} loading={loading}>
                    Gửi yêu cầu
                  </Button>
                  <Button variant="outline" onClick={() => setAction(null)}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={viewingImage} 
              alt="Document" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              variant="outline"
              className="absolute top-4 right-4"
              onClick={() => setViewingImage(null)}
            >
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
