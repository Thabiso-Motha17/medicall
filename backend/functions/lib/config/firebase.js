"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timestamp = exports.FieldValue = exports.messaging = exports.storage = exports.auth = exports.db = void 0;
/**
 * Admin SDK singleton — initialised exactly once per cold start.
 * Always import `db`, `auth`, `storage` from here, never call
 * `getFirestore()` ad hoc in feature code.
 */
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
Object.defineProperty(exports, "FieldValue", { enumerable: true, get: function () { return firestore_1.FieldValue; } });
Object.defineProperty(exports, "Timestamp", { enumerable: true, get: function () { return firestore_1.Timestamp; } });
const auth_1 = require("firebase-admin/auth");
const storage_1 = require("firebase-admin/storage");
const messaging_1 = require("firebase-admin/messaging");
if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)();
exports.db = (0, firestore_1.getFirestore)();
exports.auth = (0, auth_1.getAuth)();
exports.storage = (0, storage_1.getStorage)();
exports.messaging = (0, messaging_1.getMessaging)();
// Sensible defaults: ignore undefined so partial DTOs don't blow up writes.
exports.db.settings({ ignoreUndefinedProperties: true });
//# sourceMappingURL=firebase.js.map