export interface PushPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
    category?: "appointment" | "chat" | "payment" | "system";
}
export declare function notifyUser(uid: string, payload: PushPayload): Promise<void>;
