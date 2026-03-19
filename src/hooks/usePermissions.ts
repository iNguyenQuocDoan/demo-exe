/**
 * Custom hook for checking permissions
 */
"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { hasPermission, hasAnyPermission, hasAllPermissions, getRolePermissions, type Permission } from "@/lib/permissions";

export function usePermissions() {
  const { user } = useAuthStore();
  const role = user?.role ?? "guest";

  return {
    /**
     * Check if current user has a specific permission
     */
    can: (permission: Permission): boolean => {
      return hasPermission(role, permission);
    },

    /**
     * Check if current user has any of the specified permissions
     */
    canAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(role, permissions);
    },

    /**
     * Check if current user has all of the specified permissions
     */
    canAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(role, permissions);
    },

    /**
     * Get all permissions for current user
     */
    permissions: getRolePermissions(role),

    /**
     * Current user's role
     */
    role,
  };
}
