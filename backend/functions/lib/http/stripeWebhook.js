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
exports.stripeWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const env_1 = require("../config/env");
const paymentService = __importStar(require("../services/paymentService"));
const logger_1 = require("../lib/logger");
/**
 * Stripe webhook. MUST receive the raw request body (Functions v2 provides
 * `req.rawBody`). Verifies signature before doing any work.
 */
exports.stripeWebhook = (0, https_1.onRequest)({
    region: env_1.REGION,
    secrets: [env_1.STRIPE_SECRET_KEY, env_1.STRIPE_WEBHOOK_SECRET],
    invoker: "public", // webhook called by Stripe — auth via signature
    timeoutSeconds: 30,
    memory: "256MiB",
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("method not allowed");
        return;
    }
    const sig = req.headers["stripe-signature"];
    if (typeof sig !== "string") {
        res.status(400).send("missing signature");
        return;
    }
    let event;
    try {
        event = paymentService.verifyStripeSignature(req.rawBody, sig, env_1.STRIPE_WEBHOOK_SECRET.value());
    }
    catch (err) {
        logger_1.logger.warn("stripe signature failed", { fn: "stripeWebhook" }, { err: String(err) });
        res.status(400).send("invalid signature");
        return;
    }
    try {
        await paymentService.applyStripeEvent(event);
        res.status(200).json({ received: true });
    }
    catch (err) {
        logger_1.logger.error("stripe handler failed", err, { fn: "stripeWebhook" });
        // Return 500 so Stripe retries
        res.status(500).send("handler error");
    }
});
//# sourceMappingURL=stripeWebhook.js.map