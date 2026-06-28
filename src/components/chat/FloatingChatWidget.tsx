"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function FloatingChatWidget() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Chỉ hiển thị cho parent đã đăng nhập
  if (!user || user.role !== "parent") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => router.push("/messages")}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
        aria-label="Mở chat"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </div>
  );
}
