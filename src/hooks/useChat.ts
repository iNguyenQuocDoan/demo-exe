"use client";
/**
 * useChat – Firebase Firestore real-time chat hook.
 * Uses onSnapshot for instant message delivery without WebSocket.
 * Works on Vercel serverless (no persistent connections needed).
 */
import { useEffect, useState, useCallback } from "react";
import { subscribeMessages, sendMessage } from "@/api/chatApi";
import type { ChatMessage } from "@/api/chatApi";
import type { User } from "@/types";

interface UseChatOptions {
  convId: string;
  currentUser: User;
}

interface UseChatReturn {
  messages: ChatMessage[];
  send: (content: string) => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
}

export function useChat({ convId, currentUser }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!convId) return;
    const unsub = subscribeMessages(convId, (msgs) => {
      setMessages(msgs);
      setIsLoading(false);
    });
    return unsub;
  }, [convId]);

  const send = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await sendMessage(
        convId,
        { id: currentUser.id, name: currentUser.fullName, role: currentUser.role },
        content.trim()
      );
    },
    [convId, currentUser]
  );

  return { messages, send, isConnected: !isLoading, isLoading };
}
