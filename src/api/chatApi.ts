/**
 * chatApi — Firebase Firestore-backed real-time chat.
 *
 * Firestore structure:
 *   conversations/{convId}               — conversation metadata
 *   conversations/{convId}/messages/{id} — individual messages
 *
 * convId = "{parentId}_{tutorId}"
 *
 * REST backend (/api/conversations/*) is still called for:
 *   - getConversations: listing conversations with server-side auth filtering
 *   - getOrCreateConversation: optional backend record (ignores failures)
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { apiClient } from "@/lib/apiClient";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string; // ISO string
}

export interface Conversation {
  id: string;
  convId: string;
  parentId: string;
  tutorId: string;
  parentName: string;
  tutorName: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export function buildConvId(parentId: string, tutorId: string): string {
  return `${parentId}_${tutorId}`;
}

export async function getOrCreateConversation(
  parentId: string,
  tutorId: string,
  parentName: string,
  tutorName: string
): Promise<Conversation> {
  const convId = buildConvId(parentId, tutorId);

  // Ensure the conversation doc exists in Firestore (merge = non-destructive)
  await setDoc(
    doc(db, "conversations", convId),
    { id: convId, convId, parentId, tutorId, parentName, tutorName },
    { merge: true }
  );

  // Mirror to REST backend for permission tracking (best-effort)
  try {
    await apiClient.post("/conversations/init", { tutorId, tutorName, parentName });
  } catch { /* ignore */ }

  return { id: convId, convId, parentId, tutorId, parentName, tutorName };
}

export async function sendMessage(
  convId: string,
  sender: { id: string; name: string; role: string },
  content: string
): Promise<ChatMessage> {
  const msgsRef = collection(db, "conversations", convId, "messages");

  const docRef = await addDoc(msgsRef, {
    conversationId: convId,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    content,
    createdAt: serverTimestamp(),
  });

  // Update conversation's lastMessage preview
  await setDoc(
    doc(db, "conversations", convId),
    { lastMessage: content, lastMessageAt: serverTimestamp() },
    { merge: true }
  );

  return {
    id: docRef.id,
    conversationId: convId,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    content,
    createdAt: new Date().toISOString(),
  };
}

/** Real-time subscription via Firestore onSnapshot. Returns unsubscribe fn. */
export function subscribeMessages(
  convId: string,
  onUpdate: (msgs: ChatMessage[]) => void
): () => void {
  const q = query(
    collection(db, "conversations", convId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const msgs: ChatMessage[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        conversationId: convId,
        senderId: data.senderId as string,
        senderName: data.senderName as string,
        senderRole: data.senderRole as string,
        content: data.content as string,
        // Firestore Timestamp → ISO string (null during optimistic write)
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });
    onUpdate(msgs);
  });
}

/** List conversations for the logged-in user via REST backend. */
export async function getConversations(_userId: string, _role: string): Promise<Conversation[]> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; conversations: Conversation[] }>("/conversations");
    return data.conversations;
  } catch {
    return [];
  }
}
