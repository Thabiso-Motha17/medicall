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
exports.REGION = exports.beforeUserCreated = exports.onUserCreate = void 0;
const identity_1 = require("firebase-functions/v2/identity");
Object.defineProperty(exports, "beforeUserCreated", { enumerable: true, get: function () { return identity_1.beforeUserCreated; } });
const v1_1 = require("firebase-functions/v1"); // legacy onCreate still recommended
const env_1 = require("../config/env");
Object.defineProperty(exports, "REGION", { enumerable: true, get: function () { return env_1.REGION; } });
const userService = __importStar(require("../services/userService"));
const logger_1 = require("../lib/logger");
/**
 * Bootstrap a user document + default role claim immediately after Firebase
 * Auth creates the account. We use the v1 trigger here because v2 blocking
 * triggers (`beforeUserCreated`) require Identity Platform billing tier;
 * v1 onCreate works on Spark/Blaze without that and is fine for this use.
 */
exports.onUserCreate = v1_1.auth.user().onCreate(async (user) => {
    try {
        await userService.bootstrapUser(user.uid, {
            email: user.email ?? null,
            phone: user.phoneNumber ?? null,
            displayName: user.displayName ?? null,
            photoUrl: user.photoURL ?? null,
        });
    }
    catch (err) {
        logger_1.logger.error("onUserCreate failed", err, { uid: user.uid, fn: "onUserCreate" });
        throw err;
    }
});
//# sourceMappingURL=onUserCreate.js.map