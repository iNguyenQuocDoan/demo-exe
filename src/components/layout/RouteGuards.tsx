"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { getDefaultRoute } from "@/lib/permissions";
import type { UserRole } from "@/types";

function GuardLoading() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-3">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-5/6 mx-auto" />
      </div>
    </main>
  );
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading || !user) return;
    // getDefaultRoute gồm tutorCandidate → /dashboard/tutor-candidate (trước đây rơi về guest).
    router.replace(getDefaultRoute(user.role));
  }, [isLoading, router, user]);

  if (isLoading) return <GuardLoading />;
  if (user) return null;
  return <>{children}</>;
}

export function ProtectedRoute({
  children,
  allowRoles,
}: {
  children: React.ReactNode;
  allowRoles?: UserRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowRoles && !allowRoles.includes(user.role)) {
      router.replace(getDefaultRoute(user.role));
    }
  }, [allowRoles, isLoading, pathname, router, user]);

  if (isLoading) return <GuardLoading />;
  if (!user) return null;
  if (allowRoles && !allowRoles.includes(user.role)) return null;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowRoles={["admin"]}>{children}</ProtectedRoute>;
}
