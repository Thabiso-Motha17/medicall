import type { Timestamp } from "firebase-admin/firestore";
export interface ChatThread {
    id: string;
    appointmentId: string | null;
    participantIds: string[];
    lastMessagePreview: string;
    lastMessageAt: Timestamp | null;
    lastSenderId: string | null;
    createdAt: Timestamp;
}
export type ChatMessageType = "text" | "image" | "file";
export interface ChatMessage {
    id: string;
    senderId: string;
    type: ChatMessageType;
    text: string;
    mediaStoragePath: string | null;
    createdAt: Timestamp;
}
export interface ChatParticipantState {
    uid: string;
    unreadCount: number;
    lastReadAt: Timestamp | null;
}
