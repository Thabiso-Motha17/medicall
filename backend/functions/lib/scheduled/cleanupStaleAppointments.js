"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupStaleAppointments = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const env_1 = require("../config/env");
const appointmentService = __importStar(require("../services/appointmentService"));
const logger_1 = require("../lib/logger");
/** Auto-cancel `requested` appointments older than the configured timeout. */
exports.cleanupStaleAppointments = (0, scheduler_1.onSchedule)({ region: env_1.REGION, schedule: "every 1 minutes", timeoutSeconds: 60, memory: "256MiB" }, async () => {
    try {
        const n = await appointmentService.autoCancelStaleRequests();
        if (n > 0)
            logger_1.logger.info("auto-cancelled stale appointments", { fn: "cleanupStaleAppointments" }, { count: n });
    }
    catch (err) {
        logger_1.logger.error("cleanupStaleAppointments failed", err, { fn: "cleanupStaleAppointments" });
    }
});
//# sourceMappingURL=cleanupStaleAppointments.js.map