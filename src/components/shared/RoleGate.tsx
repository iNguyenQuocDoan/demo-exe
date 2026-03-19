/**
 * Role Gate Component
 * Only renders children if user has one of the allowed roles
 */
"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserRole } from "@/types";

interface RoleGateProps {
  children: ReactNode;
  /** Allowed roles */
  allowedRoles: UserRole[];
  /** Fallback content when role not allowed */
  fallback?: ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { user } = useAuthStore();
  const userRole = user?.role ?? "guest";

  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
