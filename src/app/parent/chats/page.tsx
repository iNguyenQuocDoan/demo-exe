"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

function ParentChatsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convId = searchParams.get("convId");
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login?redirect=/messages");
      return;
    }

    if (convId) {
      // convId dạng parentId_tutorId, vì đang ở route parent, đối tác là tutorId (phần thứ 2)
      const parts = convId.split("_");
      const tutorId = parts[1];
      if (tutorId) {
        router.replace(`/messages?partnerId=${tutorId}`);
        return;
      }
    }

    router.replace("/messages");
  }, [convId, router, user]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-app)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ParentChatsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-app)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ParentChatsRedirect />
    </Suspense>
  );
}
