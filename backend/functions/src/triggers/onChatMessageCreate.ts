import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { REGION } from "../config/env";
import { db, FieldValue, Timestamp } from "../config/firebase";
import { COLLECTIONS, SUBCOLLECTIONS } from "../config/constants";
import { notifyUser } from "../services/notificationService";
import { logger } from "../lib/logger";
import type { ChatMessage, ChatThread } from "../types/chat";

/**
 * On every new chat message:
 *  - update parent thread's denormalized lastMessage* fields
 *  - increment recipient's unreadCount
 *  - push notification (silent if recipient is online — handled client-side)
 */
export const onChatMessageCreate = onDocumentCreated(
  {
    region: REGION,
    document: `${COLLECTIONS.chatThreads}/{threadId}/${SUBCOLLECTIONS.messages}/{messageId}`,
  },
  async (event) => {
    const msg = event.data?.data() as ChatMessage | undefined;
    if (!msg) return;
    const { threadId } = event.params;

    try {
      const threadRef = db.collection(COLLECTIONS.chatThreads).doc(threadId);
      const threadSnap = await threadRef.get();
      const thread = threadSnap.data() as ChatThread | undefined;
      if (!thread) return;

      const preview = msg.type === "text"
        ? msg.text.slice(0, 140)
        : msg.type === "image" ? "📷 Photo" : "📎 Attachment";

      const batch = db.batch();
      batch.update(threadRef, {
        lastMessagePreview: preview,
        lastMessageAt: msg.createdAt ?? Timestamp.now(),
        lastSenderId: msg.senderId,
      });
      for (const uid of thread.participantIds) {
        if (uid === msg.senderId) continue;
        const partRef = threadRef.collection(SUBCOLLECTIONS.participants).doc(uid);
        batch.set(partRef, {
          uid, unreadCount: FieldValue.increment(1),
        }, { merge: true });
      }
      await batch.commit();

      await Promise.allSettled(thread.participantIds
        .filter((uid) => uid !== msg.senderId)
        .map((uid) => notifyUser(uid, {
          title: "New message",
          body: preview,
          category: "chat",
          data: { threadId, type: "chat.message" },
        })),
      );
    } catch (err) {
      logger.error("onChatMessageCreate failed", err, { fn: "onChatMessageCreate", threadId });
    }
  },
);
