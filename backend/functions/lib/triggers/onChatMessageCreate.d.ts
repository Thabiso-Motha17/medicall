/**
 * On every new chat message:
 *  - update parent thread's denormalized lastMessage* fields
 *  - increment recipient's unreadCount
 *  - push notification (silent if recipient is online — handled client-side)
 */
export declare const onChatMessageCreate: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    threadId: string;
    messageId: string;
}>>;
