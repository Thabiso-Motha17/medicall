"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const v2_1 = require("firebase-functions/v2");
function fmt(ctx, extra) {
    return { service: "medicall", ...(ctx ?? {}), ...(extra ?? {}) };
}
exports.logger = {
    debug: (msg, ctx, extra) => v2_1.logger.debug(msg, fmt(ctx, extra)),
    info: (msg, ctx, extra) => v2_1.logger.info(msg, fmt(ctx, extra)),
    warn: (msg, ctx, extra) => v2_1.logger.warn(msg, fmt(ctx, extra)),
    error: (msg, err, ctx) => v2_1.logger.error(msg, fmt(ctx, {
        err: err instanceof Error
            ? { message: err.message, stack: err.stack, name: err.name }
            : err,
    })),
};
//# sourceMappingURL=logger.js.map