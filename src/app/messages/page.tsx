"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConversationSidebar } from "./components/ConversationSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerId = searchParams.get("partnerId") || undefined;

  const { user: currentUser, isLoading: authLoading } = useAuthStore();
  const {
    displayConversations,
    messages,
    sendMessage,
    isConnected,
    isLoading: chatLoading,
    connectionError,
    partnerName,
    refetchHistory,
  } = useChat(partnerId);

  const handleSelectConversation = (id: string) => {
    router.push(`/messages?partnerId=${id}`);
  };

  const handleBackToList = () => {
    router.push("/messages");
  };

  // Trạng thái Loading của AuthStore
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-app)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Trạng thái chưa đăng nhập
  if (!currentUser) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[var(--bg-app)] px-4 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive animate-bounce" />
        <h1 className="text-xl font-bold text-foreground">Bạn chưa đăng nhập</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Vui lòng đăng nhập tài khoản để bắt đầu thảo luận và trò chuyện realtime.
        </p>
        <Button className="mt-4 rounded-xl px-6 cursor-pointer" onClick={() => router.push("/auth/login?redirect=/messages")}>
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  // Lấy thông tin cuộc trò chuyện hiện tại đang mở
  const activeConversation = displayConversations.find((c) => c.partnerId === partnerId);

  return (
    <main className="h-[100dvh] w-full bg-[var(--bg-app)] overflow-hidden flex flex-col relative">
      {/* Banner thông báo lỗi kết nối chi tiết ở trên cùng */}
      {connectionError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold text-red-500 shrink-0 z-20 animate-slide-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{connectionError}</span>
        </div>
      )}

      {/* Layout chat chính */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* SIDEBAR TRÁI: Danh sách hội thoại */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 shrink-0 h-full flex flex-col z-10 transition-all duration-300",
            partnerId ? "hidden md:flex" : "flex"
          )}
        >
          <ConversationSidebar
            conversations={displayConversations}
            selectedPartnerId={partnerId}
            isConnected={isConnected}
            connectionError={connectionError}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* KHUNG CHAT PHẢI (Chat Pane) */}
        <section
          className={cn(
            "flex-1 h-full flex flex-col bg-card overflow-hidden transition-all duration-300 relative",
            !partnerId ? "hidden md:flex" : "flex"
          )}
        >
          {partnerId ? (
            <>
              {/* Header Khung Chat */}
              <ChatHeader
                partnerId={partnerId}
                partnerName={partnerName}
                isConnected={isConnected}
                connectionError={connectionError}
                onBack={handleBackToList}
                onRefresh={() => void refetchHistory(false)}
              />

              {/* Danh sách tin nhắn cuộn */}
              <MessageList
                messages={messages}
                currentUser={currentUser}
                partnerName={partnerName}
                activeConversation={activeConversation}
                isLoading={chatLoading}
                onRetrySend={sendMessage}
              />

              {/* Vùng nhập tin nhắn cố định ở đáy */}
              <ChatInput
                isConnected={isConnected}
                connectionError={connectionError}
                onSendMessage={sendMessage}
              />
            </>
          ) : (
            // Trạng thái trống khi chưa chọn cuộc trò chuyện (Empty state)
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5 select-none h-full">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-5 animate-pulse shadow-sm">
                <MessageSquare className="h-9 w-9" />
              </div>
              <h2 className="text-base font-bold text-foreground">Chọn một cuộc trò chuyện</h2>
              <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                Hãy click chọn một gia sư hoặc phụ huynh trong danh sách bên trái để bắt đầu nhắn tin thảo luận trực tiếp.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-app)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
