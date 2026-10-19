"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRateLimit = withRateLimit;
const rateLimiter_1 = require("../lib/rateLimiter");
async function withRateLimit(uid, bucket, cfg) {
    await (0, rateLimiter_1.consume)(uid, bucket, cfg);
}
//# sourceMappingURL=withRateLimit.js.map