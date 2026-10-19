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
exports.createPaymentIntent = void 0;
const https_1 = require("firebase-functions/v2/https");
const env_1 = require("../config/env");
const requireAuth_1 = require("../middleware/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const validators_1 = require("../utils/validators");
const paymentService = __importStar(require("../services/paymentService"));
const errors_1 = require("../lib/errors");
const logger_1 = require("../lib/logger");
exports.createPaymentIntent = (0, https_1.onCall)({
    region: env_1.REGION,
    enforceAppCheck: true,
    secrets: [env_1.STRIPE_SECRET_KEY],
    timeoutSeconds: 20,
}, async (req) => {
    const ctx = (0, requireAuth_1.requireAuth)(req);
    (0, requireRole_1.requireRole)(ctx, "patient");
    const { appointmentId } = validators_1.CreatePaymentIntentInput.parse(req.data);
    try {
        return await paymentService.createIntent({
            appointmentId, patientId: ctx.uid,
        });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            throw err.toHttps();
        logger_1.logger.error("createPaymentIntent failed", err, { uid: ctx.uid });
        throw new https_1.HttpsError("internal", "Could not create payment intent");
    }
});
//# sourceMappingURL=createPaymentIntent.js.map