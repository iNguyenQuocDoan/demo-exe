"use client";

import { Client, IMessage, StompSubscription, ActivationState } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "https://liflow-be.onrender.com/ws-chat";

type ConnectOptions = {
  token: string;
  onMessage: (message: any) => void;
  onConnect?: () => void;
  onError?: (error: unknown) => void;
  onClose?: (event: any) => void;
};

class ChatService {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  connect({ token, onMessage, onConnect, onError, onClose }: ConnectOptions) {
    if (!token) {
      const err = new Error("Missing token");
      console.error("[STOMP Debug] Connect attempt failed: Missing token");
      onError?.(err);
      return;
    }

    if (this.client) {
      const isConnected = this.client.connected;
      const isActive = this.client.active;
      const isDeactivating = this.client.state === ActivationState.DEACTIVATING;

      if (isConnected || isActive || isDeactivating) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[STOMP Debug] Skipping connect: client connected=${isConnected}, active=${isActive}, state=${this.client.state}`
          );
        }
        return;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[STOMP Debug] Initializing connection...");
      console.log("[STOMP Debug] SOCKET_URL:", SOCKET_URL);
      console.log("[STOMP Debug] Token exists (boolean):", !!token);
    }

    this.client = new Client({
      webSocketFactory: () => {
        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP Debug] Creating SockJS instance with URL:", SOCKET_URL);
        }
        return new SockJS(SOCKET_URL);
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      debug:
        process.env.NODE_ENV === "development"
          ? (msg) => {
              const cleanMsg = msg.replace(
                /Authorization:\s*Bearer\s+[^\s\r\n]+/gi,
                "Authorization: Bearer <hidden-token>"
              );
              console.log("[STOMP client log]", cleanMsg);
            }
          : () => {},
      onConnect: () => {
        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP Debug] Connected successfully (onConnect)!");
        }
        if (!this.client) return;

        this.subscription =
          this.client.subscribe("/user/queue/messages", (message: IMessage) => {
            if (process.env.NODE_ENV === "development") {
              console.log("[STOMP Debug] Received message body:", message.body);
            }
            try {
              onMessage(JSON.parse(message.body));
            } catch (error) {
              console.error("Parse chat message error:", error, message.body);
            }
          });

        onConnect?.();
      },
      onStompError: (frame) => {
        console.error("[STOMP Debug] STOMP Error Frame received:");
        console.error("[STOMP Debug] Headers:", frame.headers);
        console.error("[STOMP Debug] Body:", frame.body);
        onError?.(frame);
      },
      onWebSocketError: (error) => {
        console.error("[STOMP Debug] WebSocket Error event:", error);
        onError?.(error);
      },
      onWebSocketClose: (event) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP Debug] WebSocket connection closed. Code:", event.code, "Reason:", event.reason);
        }
        onClose?.(event);
      },
      onDisconnect: (frame) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[STOMP Debug] STOMP client disconnected. Frame:", frame);
        }
      }
    });

    this.client.activate();
  }

  sendMessage(receiverId: string, content: string, currentUserId?: string) {
    const isConnected = this.isConnected();
    const destination = "/app/chat.send";

    if (process.env.NODE_ENV === "development") {
      console.log("[STOMP Debug] Pre-publish check:", {
        isConnected,
        receiverId,
        currentUserId,
        destination,
      });
    }

    if (!isConnected) {
      console.error("[STOMP Debug] sendMessage failed: STOMP client is not connected.");
      throw new Error("Chat chưa kết nối, vui lòng thử lại sau");
    }

    this.client!.publish({
      destination,
      body: JSON.stringify({
        receiverId,
        content,
      }),
    });
  }

  disconnect() {
    if (process.env.NODE_ENV === "development") {
      console.log("[STOMP Debug] Disconnecting client...");
    }
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
      } catch (err) {
        console.error("Unsubscribe error:", err);
      }
      this.subscription = null;
    }
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (err) {
        console.error("Deactivate error:", err);
      }
      this.client = null;
    }
  }

  isConnected() {
    return !!(this.client && this.client.connected);
  }
}

export const chatService = new ChatService();
