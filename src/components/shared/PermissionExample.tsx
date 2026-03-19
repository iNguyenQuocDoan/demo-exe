/**
 * Example component demonstrating Permission & Role Gates
 */
"use client";

import { PermissionGate } from "@/components/shared/PermissionGate";
import { RoleGate } from "@/components/shared/RoleGate";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";

export function PermissionExample() {
  const { can, canAny, role, permissions } = usePermissions();

  return (
    <div className="space-y-6 p-6 rounded-xl border border-border bg-card">
      <div>
        <h3 className="text-lg font-bold mb-2">Your Current Role: {role}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You have {permissions.length} permissions
        </p>
      </div>

      {/* Example 1: Single Permission */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Example 1: Single Permission Check</h4>
        <PermissionGate
          permission={PERMISSIONS.CREATE_BOOKING}
          fallback={
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              You need to be a Parent to create bookings
            </div>
          }
        >
          <Button>Create Booking (Parent only)</Button>
        </PermissionGate>
      </div>

      {/* Example 2: Any Permissions */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Example 2: Any Permission Check</h4>
        <PermissionGate
          anyPermissions={[
            PERMISSIONS.VIEW_OWN_BOOKINGS,
            PERMISSIONS.VIEW_ALL_BOOKINGS,
          ]}
          fallback={
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Only Parent, Tutor, or Admin can view bookings
            </div>
          }
        >
          <Button variant="outline">View Bookings</Button>
        </PermissionGate>
      </div>

      {/* Example 3: Role Gate */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Example 3: Role-based Check</h4>
        <RoleGate
          allowedRoles={["admin"]}
          fallback={
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Admin only feature
            </div>
          }
        >
          <Button variant="destructive">Delete User (Admin only)</Button>
        </RoleGate>
      </div>

      {/* Example 4: Hook-based Check */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Example 4: Hook-based Check</h4>
        {can(PERMISSIONS.MANAGE_TUTOR_PROFILE) ? (
          <Button>Manage Tutor Profile</Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Only Tutors can manage their profile
          </div>
        )}
      </div>

      {/* Example 5: Multiple conditions */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Example 5: Complex Permission Check</h4>
        {canAny([PERMISSIONS.WRITE_REVIEW, PERMISSIONS.MODERATE_REVIEWS]) ? (
          <Button variant="secondary">
            {can(PERMISSIONS.MODERATE_REVIEWS) ? "Moderate Reviews (Admin)" : "Write Review (Parent)"}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Parents can write reviews, Admins can moderate them
          </div>
        )}
      </div>
    </div>
  );
}
