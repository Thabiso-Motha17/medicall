"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onChatMessageCreate = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const env_1 = require("../config/env");
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const notificationService_1 = require("../services/notificationService");
const logger_1 = require("../lib/logger");
/**
 * On every new chat message:
 *  - update parent thread's denormalized lastMessage* fields
 *  - increment recipient's unreadCount
 *  - push notification (silent if recipient is online — handled client-side)
 */
exports.onChatMessageCreate = (0, firestore_1.onDocumentCreated)({
    region: env_1.REGION,
    document: `${constants_1.COLLECTIONS.chatThreads}/{threadId}/${constants_1.SUBCOLLECTIONS.messages}/{messageId}`,
}, async (event) => {
    const msg = event.data?.data();
    if (!msg)
        return;
    const { threadId } = event.params;
    try {
        const threadRef = firebase_1.db.collection(constants_1.COLLECTIONS.chatThreads).doc(threadId);
        const threadSnap = await threadRef.get();
        const thread = threadSnap.data();
        if (!thread)
            return;
        const preview = msg.type === "text"
            ? msg.text.slice(0, 140)
            : msg.type === "image" ? "📷 Photo" : "📎 Attachment";
        const batch = firebase_1.db.batch();
        batch.update(threadRef, {
            lastMessagePreview: preview,
            lastMessageAt: msg.createdAt ?? firebase_1.Timestamp.now(),
            lastSenderId: msg.senderId,
        });
        for (const uid of thread.participantIds) {
            if (uid === msg.senderId)
                continue;
            const partRef = threadRef.collection(constants_1.SUBCOLLECTIONS.participants).doc(uid);
            batch.set(partRef, {
                uid, unreadCount: firebase_1.FieldValue.increment(1),
            }, { merge: true });
        }
        await batch.commit();
        await Promise.allSettled(thread.participantIds
            .filter((uid) => uid !== msg.senderId)
            .map((uid) => (0, notificationService_1.notifyUser)(uid, {
            title: "New message",
            body: preview,
            category: "chat",
            data: { threadId, type: "chat.message" },
        })));
    }
    catch (err) {
        logger_1.logger.error("onChatMessageCreate failed", err, { fn: "onChatMessageCreate", threadId });
    }
});
//# sourceMappingURL=onChatMessageCreate.js.map