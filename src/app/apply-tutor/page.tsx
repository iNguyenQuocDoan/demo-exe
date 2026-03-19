"use client";
import { useRouter } from "next/navigation";
import { TutorApplicationForm } from "@/components/tutor/TutorApplicationForm";
import { useAuthStore } from "@/store/useAuthStore";
import { submitTutorApplication } from "@/api/tutorApplicationApi";
import type { TutorApplication } from "@/types";

export default function ApplyTutorPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleSubmit = async (application: Omit<TutorApplication, "id" | "userId" | "status" | "submittedAt">): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "Vui lòng đăng nhập" };

    try {
      // TODO: Upload files to Firebase Storage first
      // const uploadedIdCardImages = await uploadFiles(application.idCardImages);
      // const uploadedDegreeImages = await uploadFiles(application.degreeImages);
      // const uploadedCertificateImages = await uploadFiles(application.certificateImages);

      const fullApplication: Omit<TutorApplication, "id"> = {
        ...application,
        userId: user.id,
        status: "Submitted",
        submittedAt: new Date().toISOString(),
        // idCardImages: uploadedIdCardImages,
        // degreeImages: uploadedDegreeImages,
        // certificateImages: uploadedCertificateImages,
      };

      const result = await submitTutorApplication(fullApplication);
      
      if (result.ok) {
        router.push("/tutor-application");
      }
      
      return result;
    } catch (error) {
      console.error("Failed to submit application:", error);
      return { ok: false, error: "Có lỗi xảy ra khi nộp hồ sơ" };
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Đăng ký làm gia sư</h1>
        <p className="text-muted-foreground mt-1">
          Hoàn thành biểu mẫu để nộp hồ sơ ứng tuyển gia sư
        </p>
      </div>

      {user && (
        <TutorApplicationForm
          userId={user.id}
          userEmail={user.email}
          userName={user.fullName}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
