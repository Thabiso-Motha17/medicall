"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireVerifiedDoctor = requireVerifiedDoctor;
const errors_1 = require("../lib/errors");
function requireRole(ctx, ...allowed) {
    if (!allowed.includes(ctx.role)) {
        throw errors_1.Errors.forbidden(`Requires role: ${allowed.join("|")}`).toHttps();
    }
}
function requireVerifiedDoctor(ctx) {
    requireRole(ctx, "doctor");
    if (!ctx.verifiedDoctor) {
        throw errors_1.Errors.forbidden("Doctor not yet verified").toHttps();
    }
}
//# sourceMappingURL=requireRole.js.map