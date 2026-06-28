"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

function TutorChatsRedirect() {
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
      // convId dạng parentId_tutorId, vì đang ở route tutor, đối tác là parentId (phần đầu)
      const parts = convId.split("_");
      const parentId = parts[0];
      if (parentId) {
        router.replace(`/messages?partnerId=${parentId}`);
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

export default function TutorChatsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-app)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <TutorChatsRedirect />
    </Suspense>
  );
}
