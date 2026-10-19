import type { CallableRequest } from "firebase-functions/v2/https";
import { Errors } from "../lib/errors";

export interface AuthContext {
  uid: string;
  role: "patient" | "doctor" | "admin";
  email: string | null;
  emailVerified: boolean;
  verifiedDoctor: boolean;
  token: Record<string, unknown>;
}

export function requireAuth(req: CallableRequest<unknown>): AuthContext {
  const auth = req.auth;
  if (!auth) throw Errors.unauthenticated().toHttps();

  const role = auth.token.role as AuthContext["role"] | undefined;
  if (!role) throw Errors.forbidden("No role assigned").toHttps();

  return {
    uid: auth.uid,
    role,
    email: (auth.token.email as string) ?? null,
    emailVerified: Boolean(auth.token.email_verified),
    verifiedDoctor: role === "doctor" && auth.token.verified === true,
    token: auth.token as Record<string, unknown>,
  };
}
