"use client";
import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ChatBox } from "./ChatBox";
import { getOrCreateConversation, buildConvId } from "@/api/chatApi";
import { useAuthStore } from "@/store/useAuthStore";
import type { TutorProfile } from "@/types";

interface Props {
  tutor: TutorProfile;
  onClose: () => void;
}

export function ChatModal({ tutor, onClose }: Props) {
  const { user } = useAuthStore();
  const [convId, setConvId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { setError("Bạn cần đăng nhập để chat."); return; }
    if (user.role !== "parent" && user.role !== "tutor") {
      setError("Chỉ phụ huynh mới có thể chat với gia sư qua trang này.");
      return;
    }

    const parentUser = user.role === "parent" ? user : null;
    if (!parentUser) { setError("Tính năng này dành cho phụ huynh."); return; }

    getOrCreateConversation(
      parentUser.id, tutor.id, parentUser.fullName, tutor.fullName,
    ).then((conv) => setConvId(conv.id)).catch(() => setError("Không thể kết nối chat."));
  }, [user, tutor]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Chat với {tutor.fullName}</DialogTitle>
        </DialogHeader>
        {error ? (
          <div className="p-6 text-center text-sm text-[hsl(0_84%_40%)]">{error}</div>
        ) : !convId || !user ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-pulse text-sm text-[hsl(215_16%_47%)]">Đang kết nối...</div>
          </div>
        ) : (
          <div className="h-[480px] flex flex-col">
            <ChatBox convId={convId} currentUser={user} otherName={tutor.fullName} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
