import { realApiClient } from "@/lib/realApiClient";

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  status?: "sending" | "sent" | "failed"; // Dành cho optimistic update
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  time: string;
  read: boolean;
}

export async function getConversations(): Promise<Conversation[]> {
  try {
    const { data } = await realApiClient.get<Conversation[]>("/websocket/conversations");
    return data ?? [];
  } catch (error) {
    console.error("getConversations error:", error);
    return [];
  }
}

export async function getChatHistory(partnerId: string): Promise<ChatMessage[]> {
  if (!partnerId) return [];
  try {
    const { data } = await realApiClient.get<ChatMessage[]>(`/websocket/history/${partnerId}`);
    return data ?? [];
  } catch (error) {
    console.error("getChatHistory error:", error);
    return [];
  }
}

// ─── Tương thích ngược (Backward Compatibility) ──────────────────────────────
export function buildConvId(parentId: string, tutorId: string): string {
  return `${parentId}_${tutorId}`;
}

export function parseConvId(convId: string): { parentId: string; tutorId: string } | null {
  const parts = convId.split("_");
  if (parts.length !== 2) return null;
  const [parentId, tutorId] = parts;
  if (!parentId || !tutorId) return null;
  return { parentId, tutorId };
}

export async function getOrCreateConversation(
  parentId: string,
  tutorId: string,
  parentName: string,
  tutorName: string
): Promise<any> {
  return { id: `${parentId}_${tutorId}`, convId: `${parentId}_${tutorId}`, parentId, tutorId, parentName, tutorName };
}
