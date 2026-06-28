"use client";

import React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  partnerId: string;
  partnerName: string | null;
  isConnected: boolean;
  connectionError: string | null;
  onBack: () => void;
  onRefresh: () => void;
}

function getInitials(name: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  partnerId,
  partnerName,
  isConnected,
  connectionError,
  onBack,
  onRefresh,
}) => {
  const displayName = partnerName || `Đối tác (#${partnerId.substring(0, 8)})`;
  const isOnline = isConnected && !connectionError;

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Nút back trên Mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden h-9 w-9 shrink-0 rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>

        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0 border border-border shadow-sm">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId}`}
            alt={displayName}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        {/* Thông tin đối tác */}
        <div className="min-w-0">
          <h2 className="font-bold text-sm text-foreground truncate">
            {displayName}
          </h2>
          <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full inline-block animate-pulse",
                isOnline ? "bg-emerald-500" : "bg-amber-500"
              )}
            />
            {isOnline ? "Đã kết nối (Realtime)" : "Mất kết nối"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={onRefresh}
          title="Làm mới lịch sử"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
};
