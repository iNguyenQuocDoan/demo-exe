"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Trang select-role không còn được sử dụng trong luồng đăng ký mới.
 * Role được chọn ngay trong trang đăng ký (/auth/register).
 * Trang này chỉ để chuyển hướng user đến đúng dashboard.
 */
export default function SelectRolePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    // Chuyển hướng đến dashboard tương ứng với role
    switch (user.role) {
      case "parent":
        router.push("/dashboard/parent");
        break;
      case "tutor":
        router.push("/dashboard/tutor");
        break;
      case "admin":
        router.push("/admin");
        break;
      default:
        // Nếu chưa có role (guest), về trang đăng ký
        router.push("/auth/register");
        break;
    }
  }, [user, router, authLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-pulse text-sm text-muted-foreground">
        Đang chuyển hướng...
      </div>
    </div>
  );
}
