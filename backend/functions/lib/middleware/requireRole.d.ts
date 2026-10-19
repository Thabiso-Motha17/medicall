import type { AuthContext } from "./requireAuth";
export declare function requireRole(ctx: AuthContext, ...allowed: Array<AuthContext["role"]>): void;
export declare function requireVerifiedDoctor(ctx: AuthContext): void;
