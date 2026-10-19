"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUser = notifyUser;
/**
 * Notifications — one API, two transports (FCM for native data messages,
 * Expo Push for managed Expo apps). Writes an in-app feed item too.
 *
 * We cap to the 10 most recently seen devices per user; pruning of dead
 * tokens is handled by examining the FCM/Expo response.
 */
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const logger_1 = require("../lib/logger");
const expo_server_sdk_1 = require("expo-server-sdk");
const userService_1 = require("./userService");
const expo = new expo_server_sdk_1.Expo();
async function notifyUser(uid, payload) {
    // 1. In-app feed
    const feedRef = firebase_1.db.collection(constants_1.COLLECTIONS.notifications)
        .doc(uid).collection(constants_1.SUBCOLLECTIONS.items).doc();
    await feedRef.set({
        id: feedRef.id,
        title: payload.title,
        body: payload.body,
        category: payload.category ?? "system",
        data: payload.data ?? {},
        readAt: null,
        createdAt: firebase_1.Timestamp.now(),
    });
    await (0, userService_1.bumpUnread)(uid, 1);
    // 2. Devices
    const devSnap = await firebase_1.db.collection(constants_1.COLLECTIONS.users).doc(uid)
        .collection(constants_1.SUBCOLLECTIONS.devices)
        .orderBy("lastSeenAt", "desc")
        .limit(constants_1.DEFAULTS.maxDevicesPerUser)
        .get();
    if (devSnap.empty)
        return;
    const devices = devSnap.docs.map((d) => d.data());
    const fcmTokens = devices.map((d) => d.fcmToken).filter(Boolean);
    const expoTokens = devices.map((d) => d.expoPushToken).filter((t) => !!t && expo_server_sdk_1.Expo.isExpoPushToken(t));
    const tasks = [];
    if (fcmTokens.length) {
        tasks.push(firebase_1.messaging.sendEachForMulticast({
            tokens: fcmTokens,
            notification: { title: payload.title, body: payload.body },
            data: payload.data ?? {},
            android: { priority: "high" },
            apns: { payload: { aps: { sound: "default" } } },
        }).then((res) => pruneFcm(uid, fcmTokens, res)));
    }
    if (expoTokens.length) {
        const messages = expoTokens.map((to) => ({
            to,
            sound: "default",
            title: payload.title,
            body: payload.body,
            data: payload.data ?? {},
            channelId: payload.category ?? "default",
        }));
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            tasks.push(expo.sendPushNotificationsAsync(chunk).catch((err) => logger_1.logger.warn("expo push failed", { uid }, { err: String(err) })));
        }
    }
    await Promise.allSettled(tasks);
}
async function pruneFcm(uid, tokens, res) {
    const dead = [];
    res.responses.forEach((r, i) => {
        const code = r.error?.code;
        if (!r.success && (code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token")) {
            const t = tokens[i];
            if (t)
                dead.push(t);
        }
    });
    if (dead.length === 0)
        return;
    const devCol = firebase_1.db.collection(constants_1.COLLECTIONS.users).doc(uid)
        .collection(constants_1.SUBCOLLECTIONS.devices);
    const batch = firebase_1.db.batch();
    for (const tok of dead) {
        const q = await devCol.where("fcmToken", "==", tok).get();
        q.forEach((d) => batch.update(d.ref, {
            fcmToken: null, updatedAt: firebase_1.FieldValue.serverTimestamp(),
        }));
    }
    await batch.commit();
}
//# sourceMappingURL=notificationService.js.map