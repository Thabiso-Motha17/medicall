import type { CallableRequest } from "firebase-functions/v2/https";
export interface AuthContext {
    uid: string;
    role: "patient" | "doctor" | "admin";
    email: string | null;
    emailVerified: boolean;
    verifiedDoctor: boolean;
    token: Record<string, unknown>;
}
export declare function requireAuth(req: CallableRequest<unknown>): AuthContext;
