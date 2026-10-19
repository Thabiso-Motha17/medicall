import type { AuthContext } from "./requireAuth";
import { Errors } from "../lib/errors";

export function requireRole(
  ctx: AuthContext,
  ...allowed: Array<AuthContext["role"]>
): void {
  if (!allowed.includes(ctx.role)) {
    throw Errors.forbidden(`Requires role: ${allowed.join("|")}`).toHttps();
  }
}

export function requireVerifiedDoctor(ctx: AuthContext): void {
  requireRole(ctx, "doctor");
  if (!ctx.verifiedDoctor) {
    throw Errors.forbidden("Doctor not yet verified").toHttps();
  }
}
