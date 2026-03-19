/**
 * Role-based permissions system
 */

import type { UserRole } from "@/types";

// ─── Permissions Constants ────────────────────────────────────────────────────
export const PERMISSIONS = {
  // Tutor Management
  VIEW_TUTORS: "view_tutors",
  APPLY_AS_TUTOR: "apply_as_tutor",
  MANAGE_TUTOR_PROFILE: "manage_tutor_profile",
  MANAGE_AVAILABILITY: "manage_availability",
  APPROVE_TUTORS: "approve_tutors",
  
  // Booking Management
  CREATE_BOOKING: "create_booking",
  VIEW_OWN_BOOKINGS: "view_own_bookings",
  VIEW_ALL_BOOKINGS: "view_all_bookings",
  MANAGE_BOOKINGS: "manage_bookings",
  ACCEPT_REJECT_BOOKING: "accept_reject_booking",
  RESCHEDULE_BOOKING: "reschedule_booking",
  
  // User Management
  VIEW_USERS: "view_users",
  MANAGE_USERS: "manage_users",
  DELETE_USERS: "delete_users",
  
  // Reviews
  WRITE_REVIEW: "write_review",
  REPLY_REVIEW: "reply_review",
  DELETE_REVIEW: "delete_review",
  MODERATE_REVIEWS: "moderate_reviews",
  
  // Chat
  USE_CHAT: "use_chat",
  
  // Wallet & Payments
  VIEW_WALLET: "view_wallet",
  DEPOSIT_FUNDS: "deposit_funds",
  WITHDRAW_FUNDS: "withdraw_funds",
  MANAGE_PAYMENTS: "manage_payments",
  
  // Analytics
  VIEW_ANALYTICS: "view_analytics",
  VIEW_FINANCIAL_REPORTS: "view_financial_reports",
  
  // Settings
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
  MANAGE_FEE_CONFIG: "manage_fee_config",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ─── Role Permissions Map ─────────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: [
    PERMISSIONS.VIEW_TUTORS,
    PERMISSIONS.APPLY_AS_TUTOR,
  ],
  
  tutorCandidate: [
    PERMISSIONS.VIEW_TUTORS,
    // Can view application status but cannot teach yet
  ],
  
  parent: [
    PERMISSIONS.VIEW_TUTORS,
    PERMISSIONS.CREATE_BOOKING,
    PERMISSIONS.VIEW_OWN_BOOKINGS,
    PERMISSIONS.WRITE_REVIEW,
    PERMISSIONS.USE_CHAT,
    PERMISSIONS.VIEW_WALLET,
    PERMISSIONS.DEPOSIT_FUNDS,
    PERMISSIONS.WITHDRAW_FUNDS,
    PERMISSIONS.RESCHEDULE_BOOKING,
  ],
  
  tutor: [
    PERMISSIONS.VIEW_TUTORS,
    PERMISSIONS.MANAGE_TUTOR_PROFILE,
    PERMISSIONS.MANAGE_AVAILABILITY,
    PERMISSIONS.VIEW_OWN_BOOKINGS,
    PERMISSIONS.USE_CHAT,
    PERMISSIONS.ACCEPT_REJECT_BOOKING,
    PERMISSIONS.RESCHEDULE_BOOKING,
    PERMISSIONS.REPLY_REVIEW,
    PERMISSIONS.VIEW_WALLET,
    PERMISSIONS.WITHDRAW_FUNDS,
  ],
  
  admin: [
    PERMISSIONS.VIEW_TUTORS,
    PERMISSIONS.APPROVE_TUTORS,
    PERMISSIONS.VIEW_ALL_BOOKINGS,
    PERMISSIONS.MANAGE_BOOKINGS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.DELETE_REVIEW,
    PERMISSIONS.MODERATE_REVIEWS,
    PERMISSIONS.USE_CHAT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_FEE_CONFIG,
    PERMISSIONS.MANAGE_PAYMENTS,
  ],
};

// ─── Permission Helpers ───────────────────────────────────────────────────────

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// ─── Role Helpers ─────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Khách",
  parent: "Phụ huynh",
  tutorCandidate: "Ứng viên Gia sư",
  tutor: "Gia sư",
  admin: "Quản trị viên",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  guest: "Chỉ có thể xem danh sách gia sư",
  parent: "Có thể đặt lịch học và quản lý con em",
  tutorCandidate: "Đã nộp hồ sơ, chờ admin duyệt",
  tutor: "Có thể tạo hồ sơ và nhận lịch dạy",
  admin: "Quản lý toàn bộ hệ thống",
};

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  const normalizedRoute = normalizeRoute(route);

  // Public routes
  const publicExactRoutes = ["/", "/auth/login", "/auth/register"];
  if (publicExactRoutes.includes(normalizedRoute)) return true;
  if (matchesRoutePrefix(normalizedRoute, "/tutors")) return true;
  
  // Guest routes (very limited)
  if (role === "guest") {
    return ["/dashboard/guest", "/auth/select-role", "/apply-tutor"].some((r) =>
      matchesRoutePrefix(normalizedRoute, r)
    );
  }
  
  // Tutor Candidate routes
  if (role === "tutorCandidate") {
    return ["/dashboard/tutor-candidate", "/tutor-application"].some((r) =>
      matchesRoutePrefix(normalizedRoute, r)
    );
  }
  
  // Parent routes
  if (role === "parent") {
    return ["/dashboard/parent", "/parent", "/bookings", "/reviews", "/chat"].some((r) =>
      matchesRoutePrefix(normalizedRoute, r)
    );
  }
  
  // Tutor routes
  if (role === "tutor") {
    return ["/dashboard/tutor", "/tutor", "/profile", "/availability", "/bookings", "/chat"].some((r) =>
      matchesRoutePrefix(normalizedRoute, r)
    );
  }
  
  // Admin routes
  if (role === "admin") {
    return true; // Admin can access all routes
  }
  
  return false;
}

function normalizeRoute(route: string): string {
  const cleaned = route.split("?")[0].split("#")[0];
  if (!cleaned || cleaned === "/") return "/";
  return cleaned.replace(/\/+$/, "");
}

function matchesRoutePrefix(route: string, prefix: string): boolean {
  return route === prefix || route.startsWith(`${prefix}/`);
}

/**
 * Get default redirect path for a role
 */
export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case "guest":
      return "/dashboard/guest";
    case "tutorCandidate":
      return "/dashboard/tutor-candidate";
    case "parent":
      return "/dashboard/parent";
    case "tutor":
      return "/dashboard/tutor";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/";
  }
}

/**
 * Check if role can be upgraded to another role
 */
export function canUpgradeRole(fromRole: UserRole, toRole: UserRole): boolean {
  // Guest can upgrade to Parent or submit Tutor application
  if (fromRole === "guest" && (toRole === "parent" || toRole === "tutorCandidate")) {
    return true;
  }
  
  // Tutor Candidate cannot self-upgrade (admin must approve)
  if (fromRole === "tutorCandidate") {
    return false;
  }
  
  // Admin can only be set manually (not through upgrade)
  if (toRole === "admin") {
    return false;
  }
  
  return false;
}
