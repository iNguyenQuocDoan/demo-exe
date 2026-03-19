"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationList } from "@/components/admin/ApplicationList";
import { ApplicationReview } from "@/components/admin/ApplicationReview";
import { useAuthStore } from "@/store/useAuthStore";
import type { TutorApplication } from "@/types";
import { 
  getAllTutorApplications, 
  updateApplicationStatus 
} from "@/api/tutorApplicationApi";

export default function AdminApplicationsPage() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<TutorApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void loadApplications();
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getAllTutorApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adminNotes?: string) => {
    if (!selectedApp || !user) return;

    try {
      await updateApplicationStatus(
        selectedApp.id,
        "Approved",
        user.id,
        adminNotes
      );

      // Reload applications and go back to list
      await loadApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("Có lỗi xảy ra khi duyệt hồ sơ!");
    }
  };

  const handleReject = async (reason: string, adminNotes?: string) => {
    if (!selectedApp || !user) return;

    try {
      await updateApplicationStatus(
        selectedApp.id,
        "Rejected",
        user.id,
        adminNotes,
        reason
      );

      // Reload applications and go back to list
      await loadApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error("Failed to reject application:", error);
      alert("Có lỗi xảy ra khi từ chối hồ sơ!");
    }
  };

  const handleRequestInfo = async (requestNotes: string) => {
    if (!selectedApp || !user) return;

    try {
      await updateApplicationStatus(
        selectedApp.id,
        "ReSubmit",
        user.id,
        requestNotes
      );

      // Reload applications and go back to list
      await loadApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error("Failed to request info:", error);
      alert("Có lỗi xảy ra khi yêu cầu bổ sung thông tin!");
    }
  };

  return (
    <div className="pt-4 pb-8">
      <div className="site-container">
      {selectedApp ? (
        <div>
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => setSelectedApp(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
          
          <ApplicationReview
            application={selectedApp}
            adminId={user?.id ?? ""}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestInfo={handleRequestInfo}
          />
        </div>
      ) : (
        <ApplicationList
          applications={applications}
          onView={setSelectedApp}
          loading={loading}
        />
      )}
      </div>
    </div>
  );
}
