"use client";
import React, { useState } from "react";
import { Search, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { TutorApplication, TutorApplicationStatus } from "@/types";

interface ApplicationListProps {
  applications: TutorApplication[];
  onView: (application: TutorApplication) => void;
  loading?: boolean;
}

export function ApplicationList({ applications, onView, loading }: ApplicationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TutorApplicationStatus | "All">("All");

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const getStatusCount = (status: TutorApplicationStatus | "All") => {
    if (status === "All") return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-10 rounded-lg" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Danh sách hồ sơ ứng tuyển</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <Card 
            className={`cursor-pointer transition-all hover:border-primary ${statusFilter === "All" ? "border-primary" : ""}`}
            onClick={() => setStatusFilter("All")}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Tất cả</p>
              <p className="text-2xl font-bold">{getStatusCount("All")}</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:border-yellow-500 ${statusFilter === "Submitted" ? "border-yellow-500" : ""}`}
            onClick={() => setStatusFilter("Submitted")}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">{getStatusCount("Submitted")}</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:border-blue-500 ${statusFilter === "Reviewing" ? "border-blue-500" : ""}`}
            onClick={() => setStatusFilter("Reviewing")}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Đang xét</p>
              <p className="text-2xl font-bold text-blue-600">{getStatusCount("Reviewing")}</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:border-green-500 ${statusFilter === "Approved" ? "border-green-500" : ""}`}
            onClick={() => setStatusFilter("Approved")}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">{getStatusCount("Approved")}</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:border-red-500 ${statusFilter === "Rejected" ? "border-red-500" : ""}`}
            onClick={() => setStatusFilter("Rejected")}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Từ chối</p>
              <p className="text-2xl font-bold text-red-600">{getStatusCount("Rejected")}</p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:border-purple-500 ${statusFilter === "ReSubmit" ? "border-purple-500" : ""}`}
            onClick={() => setStatusFilter("ReSubmit")}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Bổ sung</p>
              <p className="text-2xl font-bold text-purple-600">{getStatusCount("ReSubmit")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Không tìm thấy hồ sơ nào
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="hover:border-primary transition-all cursor-pointer" onClick={() => onView(app)}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{app.fullName}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    <div className="grid gap-3 text-sm text-muted-foreground mb-3 sm:grid-cols-2 md:grid-cols-3">
                      <div>
                        <p className="font-medium text-foreground">{app.email}</p>
                        <p>{app.phone}</p>
                      </div>
                      
                      <div>
                        <p><span className="font-medium text-foreground">Trình độ:</span> {app.education}</p>
                        <p><span className="font-medium text-foreground">Bằng:</span> {app.degree}</p>
                      </div>
                      
                      <div>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Nộp: {new Date(app.submittedAt).toLocaleDateString("vi-VN")}
                        </p>
                        {app.reviewedAt && (
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Xét: {new Date(app.reviewedAt).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Môn:</span>
                      {app.subjects.slice(0, 3).map(subject => (
                        <Badge key={subject} variant="outline" className="text-xs">{subject}</Badge>
                      ))}
                      {app.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{app.subjects.length - 3}</Badge>
                      )}
                      
                      <span className="text-xs text-muted-foreground ml-3">Lớp:</span>
                      {app.grades.slice(0, 3).map(grade => (
                        <Badge key={grade} variant="outline" className="text-xs">{grade}</Badge>
                      ))}
                      {app.grades.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{app.grades.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={() => onView(app)}>
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
