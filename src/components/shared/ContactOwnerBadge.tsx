import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ContactOwner } from "@/types/booking-enhanced";

interface ContactOwnerBadgeProps {
  owner: ContactOwner;
  variant?: "compact" | "full";
  lang?: "vi" | "en";
  className?: string;
}

const roleLabels = {
  TUTOR: { vi: "Gia sư", en: "Tutor", color: "bg-blue-500" },
  SUPPORT_STAFF: { vi: "Hỗ trợ", en: "Support", color: "bg-green-500" },
  ADMIN: { vi: "Quản trị", en: "Admin", color: "bg-purple-500" },
};

export function ContactOwnerBadge({
  owner,
  variant = "full",
  lang = "vi",
  className,
}: ContactOwnerBadgeProps) {
  const roleInfo = roleLabels[owner.role];
  const initials = owner.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={owner.avatarUrl} alt={owner.name} />
          <AvatarFallback className={cn("text-xs text-white", roleInfo.color)}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{owner.name}</span>
          <Badge variant="secondary" className="text-xs">
            {roleInfo[lang]}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border bg-card",
        className,
      )}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={owner.avatarUrl} alt={owner.name} />
        <AvatarFallback className={cn("text-white", roleInfo.color)}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold">{owner.name}</h4>
          <Badge variant="secondary">{roleInfo[lang]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {lang === "vi" ? "Người phụ trách" : "Contact Owner"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {lang === "vi" ? "Được giao từ" : "Assigned on"}{" "}
          {new Date(owner.assignedAt).toLocaleDateString(
            lang === "vi" ? "vi-VN" : "en-US",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            },
          )}
        </p>
      </div>
    </div>
  );
}
