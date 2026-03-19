/**
 * Permission Gate Component
 * Only renders children if user has required permissions
 */
"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/permissions";

interface PermissionGateProps {
  children: ReactNode;
  /** Single permission required */
  permission?: Permission;
  /** Any of these permissions required */
  anyPermissions?: Permission[];
  /** All of these permissions required */
  allPermissions?: Permission[];
  /** Fallback content when permission denied */
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions();

  let hasAccess = true;

  if (permission && !can(permission)) {
    hasAccess = false;
  }

  if (anyPermissions && !canAny(anyPermissions)) {
    hasAccess = false;
  }

  if (allPermissions && !canAll(allPermissions)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
