"use client";

import React, { useState } from "react";
import { MessageSquare, Search, Wifi, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Conversation } from "@/api/chatApi";
import { ConversationItem } from "./ConversationItem";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedPartnerId?: string;
  isConnected: boolean;
  connectionError: string | null;
  onSelectConversation: (partnerId: string) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  selectedPartnerId,
  isConnected,
  connectionError,
  onSelectConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((c) =>
    (c.partnerName || c.partnerId)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const isOnline = isConnected && !connectionError;

  return (
    <aside className="w-full h-full flex flex-col bg-card border-r border-border min-w-0">
      {/* Header Sidebar */}
      <div className="p-4 border-b border-border space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Hội thoại
          </h1>
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors duration-300",
              isOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
            )}
          >
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isOnline ? "Trực tuyến" : "Mất kết nối"}
          </div>
        </div>

        {/* Tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 h-9 rounded-xl bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary text-sm shadow-inner"
          />
        </div>
      </div>

      {/* Danh sách hội thoại cuộn */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 scrollbar-thin">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground h-48">
            <MessageSquare className="h-10 w-10 mb-2 opacity-20 text-foreground" />
            <span>Không tìm thấy hội thoại nào.</span>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.partnerId}
              conversation={conv}
              isActive={conv.partnerId === selectedPartnerId}
              onClick={() => onSelectConversation(conv.partnerId)}
            />
          ))
        )}
      </div>
    </aside>
  );
};
