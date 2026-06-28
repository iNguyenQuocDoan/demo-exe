"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { chatService } from "@/lib/chat/chatService";
import { getConversations, getChatHistory, type ChatMessage, type Conversation } from "@/api/chatApi";
import { getTutorById } from "@/api/tutorApi";
import { useAuthStore } from "@/store/useAuthStore";
import { getStoredToken } from "@/lib/apiClient";
import { toast } from "sonner";

interface UseChatReturn {
  conversations: Conversation[];
  displayConversations: Conversation[];
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  send: (content: string) => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  connectionError: string | null;
  partnerName: string | null;
  refetchConversations: () => Promise<void>;
  refetchHistory: (isFirstLoad?: boolean) => Promise<void>;
}

export function useChat(partnerId?: string): UseChatReturn {
  const { user: currentUser } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);

  const partnerIdRef = useRef(partnerId);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    partnerIdRef.current = partnerId;
  }, [partnerId]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Log thông tin User đăng nhập để phục vụ chẩn đoán ID
  useEffect(() => {
    if (currentUser) {
      console.log(`[STOMP Debug] Current User logged in: id = ${currentUser.id}, role = ${currentUser.role}, name = ${currentUser.fullName}`);
      if (currentUser.role === "tutor") {
        console.log(`[STOMP Debug] Tutor auth/me id = ${currentUser.id}`);
        console.log(`[STOMP Debug] Compare with Parent URL partnerId: ${partnerIdRef.current}`);
      }
    }
  }, [currentUser]);

  // Tải danh sách cuộc hội thoại và in log dev chi tiết
  const refetchConversations = useCallback(async () => {
    const currentUsr = currentUserRef.current;
    if (!currentUsr) return;
    try {
      const list = await getConversations();
      setConversations(list);

      // In log dev chi tiết cho từng vai trò
      if (currentUsr.role === "tutor") {
        console.log(`[STOMP Debug] tutor currentUser.id = ${currentUsr.id}`);
        console.log(`[STOMP Debug] tutor conversations count = ${list.length}`);
        console.log("[STOMP Debug] tutor conversations data =", list);
        if (list.length === 0) {
          console.warn("[STOMP Debug] FE đã connected/subscribed và gửi đúng /app/chat.send. Cần BE kiểm tra controller nhận message, lưu DB và convertAndSendToUser.");
        }
      } else {
        console.log(`[STOMP Debug] parent conversations count = ${list.length}`);
        if (list.length > 0) {
          console.log("[STOMP Debug] parent last conversation =", list[0]);
        }
      }
    } catch (err) {
      console.error("[STOMP Debug] getConversations error:", err);
    }
  }, []);

  // Tải lịch sử tin nhắn và in log dev
  const refetchHistory = useCallback(async (isFirstLoad = false) => {
    const activePartner = partnerIdRef.current;
    if (!activePartner) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    if (isFirstLoad) {
      setIsLoading(true);
    }
    try {
      const history = await getChatHistory(activePartner);
      
      setMessages((prev) => {
        if (isFirstLoad) {
          if (process.env.NODE_ENV === "development") {
            console.log(`[STOMP Debug] First load history count = ${history.length} for partnerId = ${activePartner}`);
          }
          return history;
        }

        // Logic Merge lịch sử tin nhắn
        const historyIds = new Set(history.map((m) => m.id));
        const tempMessages = prev.filter((m) => {
          if (m.id.startsWith("temp-")) {
            const hasRealMsg = history.some(
              (h) => h.content === m.content && h.senderId === m.senderId
            );
            return !hasRealMsg;
          }
          return !historyIds.has(m.id);
        });

        const merged = [...history, ...tempMessages].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Cảnh báo nếu đã gửi qua WebSocket nhưng history API chưa trả về
        const lastPrevMsg = prev[prev.length - 1];
        if (lastPrevMsg && lastPrevMsg.id.startsWith("temp-")) {
          const isSavedInHistory = history.some(
            (h) => h.content === lastPrevMsg.content && h.senderId === lastPrevMsg.senderId
          );
          if (!isSavedInHistory && process.env.NODE_ENV === "development") {
            console.warn(
              `[STOMP Debug] Warning: Tin nhắn đã được gửi thành công qua WebSocket tới /app/chat.send, nhưng API lịch sử (GET /api/websocket/history/${activePartner}) vẫn chưa trả về tin nhắn này. FE đã gửi đúng userId và STOMP frame thành công. Cần BE kiểm tra ChatController "/app/chat.send": lưu DB và convertAndSendToUser đúng Principal/userId.`
            );
          }
        }

        if (process.env.NODE_ENV === "development") {
          console.log(`[STOMP Debug] Refetched history count = ${history.length} for partnerId = ${activePartner}`);
        }
        return merged;
      });
    } catch (err) {
      console.error("[STOMP Debug] Fetch history error:", err);
      if (isFirstLoad) {
        setMessages([]);
      }
    } finally {
      if (isFirstLoad) {
        setIsLoading(false);
      }
    }
  }, []);

  // Tải thông tin đối tác để lấy tên thật
  const fetchPartnerInfo = useCallback(async (pId: string) => {
    try {
      const tutor = await getTutorById(pId);
      if (tutor) {
        setPartnerName(tutor.fullName);
      } else {
        setPartnerName(null);
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[STOMP Debug] Fetch partner detail failed, fallback to ID:", err);
      }
      setPartnerName(null);
    }
  }, []);

  // TỰ ĐỘNG TÌM TÊN ĐỐI TÁC
  useEffect(() => {
    if (!partnerId) {
      setPartnerName(null);
      return;
    }

    const existing = conversations.find((c) => c.partnerId === partnerId);
    if (existing && existing.partnerName) {
      setPartnerName(existing.partnerName);
    } else {
      void fetchPartnerInfo(partnerId);
    }
  }, [partnerId, conversations, fetchPartnerInfo]);

  // TẢI LỊCH SỬ TIN NHẮN (Chỉ chạy khi partnerId hoặc currentUser thực sự thay đổi!)
  useEffect(() => {
    if (currentUser) {
      void refetchHistory(true); // isFirstLoad = true
    }
  }, [partnerId, currentUser, refetchHistory]);

  // Handler khi nhận tin nhắn realtime qua WebSocket
  const handleIncomingMessage = useCallback((msg: ChatMessage) => {
    const activePartnerId = partnerIdRef.current;
    const currentUsr = currentUserRef.current;

    if (!currentUsr) return;

    if (process.env.NODE_ENV === "development") {
      console.log("[STOMP Debug] Realtime message received:", msg);
    }

    // Xác định đối tác chat (partnerId) dựa trên người gửi/người nhận
    const partnerUuid = msg.senderId !== currentUsr.id ? msg.senderId : msg.receiverId;

    // Tin nhắn thuộc cuộc trò chuyện hiện tại nếu liên quan đến activePartnerId
    const isBelongToActiveChat =
      activePartnerId &&
      (msg.senderId === activePartnerId || msg.receiverId === activePartnerId);

    if (isBelongToActiveChat) {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;

        const tempIndex = prev.findIndex(
          (m) => m.status === "sending" && m.content === msg.content
        );

        let next;
        if (tempIndex !== -1 && msg.senderId === currentUsr.id) {
          next = [...prev];
          next[tempIndex] = { ...msg, status: "sent" as const };
        } else {
          next = [...prev, { ...msg, status: "sent" as const }];
        }

        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP Debug] Incoming message appended. messages.length =", next.length);
        }
        return next;
      });
    }

    // Cập nhật preview trong danh sách cuộc trò chuyện
    setConversations((prev) => {
      const existingIndex = prev.findIndex((c) => c.partnerId === partnerUuid);
      const rawMsg = msg as any;
      const partnerDisplayName = existingIndex !== -1
        ? prev[existingIndex].partnerName
        : (rawMsg.senderName || rawMsg.sender?.fullName || (msg.senderId === currentUsr.id ? "Đối tác" : "Phụ huynh"));

      const updatedConv: Conversation = {
        partnerId: partnerUuid,
        partnerName: partnerDisplayName,
        lastMessage: msg.content,
        time: msg.createdAt || new Date().toISOString(),
        read: msg.senderId === currentUsr.id ? true : false,
      };

      let newConvs = [...prev];
      if (existingIndex !== -1) {
        newConvs.splice(existingIndex, 1);
      }
      return [updatedConv, ...newConvs];
    });

    void refetchConversations();
  }, [refetchConversations]);

  const handleIncomingMessageRef = useRef(handleIncomingMessage);
  useEffect(() => {
    handleIncomingMessageRef.current = handleIncomingMessage;
  }, [handleIncomingMessage]);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const currentUserId = currentUser?.id;

  // Kết nối WebSocket và lắng nghe
  useEffect(() => {
    if (!token || !currentUserId) {
      setIsLoading(false);
      setIsConnected(false);
      chatService.disconnect();
      return;
    }

    setConnectionError(null);
    void refetchConversations();

    chatService.connect({
      token,
      onMessage: (msg) => {
        handleIncomingMessageRef.current(msg);
      },
      onConnect: () => {
        setIsConnected(true);
        setConnectionError(null);
      },
      onError: (err: any) => {
        console.error("[STOMP Debug] Connection error callback fired:", err);
        setIsConnected(false);

        if (err && err.headers) {
          const stompMessage = err.headers["message"] || "";
          if (stompMessage.includes("Unauthorized") || stompMessage.includes("expired")) {
            setConnectionError("Phiên đăng nhập hết hạn hoặc không có quyền kết nối chat");
            return;
          }
        }
        setConnectionError("Không thể kết nối máy chủ chat");
      },
      onClose: (event) => {
        setIsConnected(false);
        if (event && (event.code === 4001 || event.code === 1002)) {
          setConnectionError("Không thể kết nối máy chủ chat");
        }
      }
    });

    setIsConnected(chatService.isConnected());

    const interval = setInterval(() => {
      const currentStatus = chatService.isConnected();
      setIsConnected(currentStatus);
      if (currentStatus) {
        setConnectionError(null);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      chatService.disconnect();
    };
  }, [token, currentUserId]);

  // Sinh cuộc hội thoại tạm thời khi bắt đầu chat mới
  const displayConversations = useMemo(() => {
    if (!partnerId) return conversations;
    const exists = conversations.some((c) => c.partnerId === partnerId);
    if (exists) return conversations;

    const tempConv: Conversation = {
      partnerId,
      partnerName: partnerName || `Gia sư (#${partnerId.substring(0, 8)})`,
      lastMessage: "",
      time: "",
      read: true,
    };
    return [tempConv, ...conversations];
  }, [conversations, partnerId, partnerName]);

  // Gửi tin nhắn
  const sendMessage = useCallback(async (content: string) => {
    const activePartnerId = partnerIdRef.current;
    const currentUsr = currentUserRef.current;

    if (!content.trim()) return;

    // Chỉ cho gửi khi WebSocket thật sự connected
    if (!chatService.isConnected()) {
      toast.error("Chat chưa kết nối, vui lòng thử lại sau");
      return;
    }

    if (!activePartnerId) {
      toast.error("Không xác định được người nhận tin nhắn.");
      return;
    }

    if (!currentUsr) {
      toast.error("Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[STOMP Debug] sendMessage: currentUser.id =", currentUsr.id);
      console.log("[STOMP Debug] sendMessage: partnerId =", activePartnerId);
    }

    // Tạo tin nhắn tạm (Optimistic)
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      senderId: currentUsr.id,
      receiverId: activePartnerId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      read: true,
      status: "sending",
    };

    setMessages((prev) => {
      const next = [...prev, tempMsg];
      if (process.env.NODE_ENV === "development") {
        console.log("[STOMP Debug] messages updated optimistic. Length =", next.length);
      }
      return next;
    });

    setConversations((prev) => {
      const existingIndex = prev.findIndex((c) => c.partnerId === activePartnerId);
      const partnerDisplayName = existingIndex !== -1 ? prev[existingIndex].partnerName : (partnerName || "Đang kết nối...");
      const updatedConv: Conversation = {
        partnerId: activePartnerId,
        partnerName: partnerDisplayName,
        lastMessage: content.trim(),
        time: new Date().toISOString(),
        read: true,
      };
      let newConvs = [...prev];
      if (existingIndex !== -1) {
        newConvs.splice(existingIndex, 1);
      }
      return [updatedConv, ...newConvs];
    });

    // Gửi qua WebSocket STOMP
    try {
      chatService.sendMessage(activePartnerId, content.trim(), currentUsr.id);
      
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "sent" as const } : m))
      );

      setTimeout(() => {
        void refetchHistory(false); // Refetch merge
      }, 1000);

    } catch (error) {
      console.error("[STOMP Debug] Send message failed:", error);
      toast.error("Không thể gửi tin nhắn. Đang kết nối lại!");
      
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" as const } : m))
      );
    }
  }, [partnerName, refetchHistory]);

  return {
    conversations,
    displayConversations,
    messages,
    sendMessage,
    send: sendMessage,
    isConnected,
    isLoading,
    connectionError,
    partnerName,
    refetchConversations,
    refetchHistory,
  };
}
