"use client";

import React, { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage, Conversation } from "@/api/chatApi";
import { User } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: User;
  partnerName: string | null;
  activeConversation?: Conversation;
  isLoading: boolean;
  onRetrySend?: (content: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  partnerName,
  activeConversation,
  isLoading,
  onRetrySend,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống cuối mỗi khi messages thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      // Dùng timeout ngắn để đảm bảo DOM đã render xong hoàn toàn
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scrollbar-thin">
        <div className="flex gap-3 max-w-[75%]">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-16 rounded-2xl rounded-tl-sm w-full animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3 max-w-[75%] ml-auto flex-row-reverse">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-12 rounded-2xl rounded-tr-sm w-full animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3 max-w-[75%]">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-20 rounded-2xl rounded-tl-sm w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    const displayName = partnerName || activeConversation?.partnerName || "đối tác";
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5 min-h-0">
        <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3 shadow-sm">
          <MessageSquare className="h-7 w-7" />
        </div>
        <h3 className="font-bold text-sm text-foreground">Chưa có tin nhắn nào</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Bắt đầu cuộc trò chuyện đầu tiên với {displayName} bằng cách gửi tin nhắn ở ô nhập bên dưới!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scrollbar-thin flex flex-col min-h-0">
      {messages.map((msg) => {
        const isMine = msg.senderId === currentUser.id;
        const senderDisplayName = isMine
          ? currentUser.fullName
          : (partnerName || activeConversation?.partnerName || "Đối tác");

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={isMine}
            senderName={senderDisplayName}
            onRetrySend={onRetrySend}
          />
        );
      })}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
};
