/**
 * Notifications — one API, two transports (FCM for native data messages,
 * Expo Push for managed Expo apps). Writes an in-app feed item too.
 *
 * We cap to the 10 most recently seen devices per user; pruning of dead
 * tokens is handled by examining the FCM/Expo response.
 */
import { db, messaging, FieldValue, Timestamp } from "../config/firebase";
import { COLLECTIONS, DEFAULTS, SUBCOLLECTIONS } from "../config/constants";
import { logger } from "../lib/logger";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import type { Device } from "../types/user";
import { bumpUnread } from "./userService";

const expo = new Expo();

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;          // string-only for FCM data messages
  category?: "appointment" | "chat" | "payment" | "system";
}

export async function notifyUser(uid: string, payload: PushPayload): Promise<void> {
  // 1. In-app feed
  const feedRef = db.collection(COLLECTIONS.notifications)
    .doc(uid).collection(SUBCOLLECTIONS.items).doc();
  await feedRef.set({
    id: feedRef.id,
    title: payload.title,
    body: payload.body,
    category: payload.category ?? "system",
    data: payload.data ?? {},
    readAt: null,
    createdAt: Timestamp.now(),
  });
  await bumpUnread(uid, 1);

  // 2. Devices
  const devSnap = await db.collection(COLLECTIONS.users).doc(uid)
    .collection(SUBCOLLECTIONS.devices)
    .orderBy("lastSeenAt", "desc")
    .limit(DEFAULTS.maxDevicesPerUser)
    .get();
  if (devSnap.empty) return;

  const devices = devSnap.docs.map((d) => d.data() as Device);
  const fcmTokens   = devices.map((d) => d.fcmToken).filter(Boolean) as string[];
  const expoTokens  = devices.map((d) => d.expoPushToken).filter(
    (t): t is string => !!t && Expo.isExpoPushToken(t),
  );

  const tasks: Promise<unknown>[] = [];

  if (fcmTokens.length) {
    tasks.push(messaging.sendEachForMulticast({
      tokens: fcmTokens,
      notification: { title: payload.title, body: payload.body },
      data: payload.data ?? {},
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    }).then((res) => pruneFcm(uid, fcmTokens, res)));
  }

  if (expoTokens.length) {
    const messages: ExpoPushMessage[] = expoTokens.map((to) => ({
      to,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      channelId: payload.category ?? "default",
    }));
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      tasks.push(expo.sendPushNotificationsAsync(chunk).catch((err) =>
        logger.warn("expo push failed", { uid }, { err: String(err) }),
      ));
    }
  }

  await Promise.allSettled(tasks);
}

async function pruneFcm(
  uid: string,
  tokens: string[],
  res: { responses: Array<{ success: boolean; error?: { code?: string } }> },
): Promise<void> {
  const dead: string[] = [];
  res.responses.forEach((r, i) => {
    const code = r.error?.code;
    if (!r.success && (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    )) {
      const t = tokens[i];
      if (t) dead.push(t);
    }
  });
  if (dead.length === 0) return;
  const devCol = db.collection(COLLECTIONS.users).doc(uid)
    .collection(SUBCOLLECTIONS.devices);
  const batch = db.batch();
  for (const tok of dead) {
    const q = await devCol.where("fcmToken", "==", tok).get();
    q.forEach((d) => batch.update(d.ref, {
      fcmToken: null, updatedAt: FieldValue.serverTimestamp(),
    }));
  }
  await batch.commit();
}
