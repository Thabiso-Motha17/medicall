"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const errors_1 = require("../lib/errors");
function requireAuth(req) {
    const auth = req.auth;
    if (!auth)
        throw errors_1.Errors.unauthenticated().toHttps();
    const role = auth.token.role;
    if (!role)
        throw errors_1.Errors.forbidden("No role assigned").toHttps();
    return {
        uid: auth.uid,
        role,
        email: auth.token.email ?? null,
        emailVerified: Boolean(auth.token.email_verified),
        verifiedDoctor: role === "doctor" && auth.token.verified === true,
        token: auth.token,
    };
}
//# sourceMappingURL=requireAuth.js.map