"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUserRole } from "@/api/authApi";
import { ROLE_LABELS } from "@/lib/permissions";

export default function SelectRolePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login: updateUser } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<"parent" | "tutor" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.role !== "guest") {
      router.push(`/dashboard/${user.role}`);
    }
  }, [user, router, authLoading]);

  const handleContinue = async () => {
    if (!selectedRole || !user) return;

    // Tutor: redirect to application form — role assigned after admin approval
    if (selectedRole === "tutor") {
      router.push("/apply-tutor");
      return;
    }

    setError("");
    setLoading(true);

    const result = await updateUserRole(user.id, selectedRole);

    if (result.ok) {
      updateUser({ ...user, role: selectedRole });
      document.cookie = `auth_role=${selectedRole}; path=/; SameSite=Strict; max-age=86400`;
      router.push(`/dashboard/${selectedRole}`);
    } else {
      setError(result.error ?? "Có lỗi xảy ra khi cập nhật vai trò.");
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== "guest") {
    return null;
  }

  const roleOptions: Array<{
    role: "parent" | "tutor";
    icon: typeof Users;
    label: string;
    description: string;
    features: string[];
    color: string;
    note?: string;
  }> = [
    {
      role: "parent",
      icon: Users,
      label: "Phụ huynh",
      description: "Tìm kiếm và đặt lịch với gia sư phù hợp",
      features: [
        "Tìm kiếm gia sư theo khu vực và môn học",
        "Xem lịch trống và đặt buổi học",
        "Quản lý lịch sử học tập của con em",
        "Đánh giá và nhận xét gia sư",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      role: "tutor",
      icon: BookOpen,
      label: "Gia sư",
      description: "Tạo hồ sơ và nhận lịch dạy từ phụ huynh",
      features: [
        "Điền hồ sơ + tải bằng cấp để xét duyệt",
        "Thiết lập lịch trống và giá dạy",
        "Nhận yêu cầu đặt lịch từ phụ huynh",
        "Quản lý thu nhập và lịch dạy",
      ],
      color: "from-purple-500 to-pink-500",
      note: "Cần hoàn thành hồ sơ & được admin duyệt trước khi hoạt động",
    },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-background to-accent/5 px-4 py-12">
      <div className="w-full max-w-4xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 mb-4 shadow-lg shadow-primary/30">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Chào mừng, {user.fullName}!
          </h1>
          <p className="text-muted-foreground">
            Vui lòng chọn vai trò của bạn để tiếp tục
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {roleOptions.map(({ role, icon: Icon, label, description, features, color, note }) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                selectedRole === role
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              }`}
            >
              {selectedRole === role && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              )}

              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br ${color} mb-4 shadow-md`}>
                <Icon className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-1">{label}</h3>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>

              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {note && (
                <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {note}
                </p>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            disabled={loading}
            className="min-w-30"
          >
            Để sau
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            loading={loading}
            className="min-w-50 text-base font-semibold"
          >
            {selectedRole === "tutor"
              ? "Điền hồ sơ gia sư"
              : `Tiếp tục với vai trò ${selectedRole ? ROLE_LABELS[selectedRole] : ""}`}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bạn có thể thay đổi vai trò trong cài đặt tài khoản sau
        </p>
      </div>
    </main>
  );
}
