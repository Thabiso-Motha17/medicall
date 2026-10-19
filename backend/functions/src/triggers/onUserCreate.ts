import { beforeUserCreated } from "firebase-functions/v2/identity";
import { auth as functionsAuth } from "firebase-functions/v1";  // legacy onCreate still recommended
import { REGION } from "../config/env";
import * as userService from "../services/userService";
import { logger } from "../lib/logger";

/**
 * Bootstrap a user document + default role claim immediately after Firebase
 * Auth creates the account. We use the v1 trigger here because v2 blocking
 * triggers (`beforeUserCreated`) require Identity Platform billing tier;
 * v1 onCreate works on Spark/Blaze without that and is fine for this use.
 */
export const onUserCreate = functionsAuth.user().onCreate(async (user) => {
  try {
    await userService.bootstrapUser(user.uid, {
      email: user.email ?? null,
      phone: user.phoneNumber ?? null,
      displayName: user.displayName ?? null,
      photoUrl: user.photoURL ?? null,
    });
  } catch (err) {
    logger.error("onUserCreate failed", err, { uid: user.uid, fn: "onUserCreate" });
    throw err;
  }
});

// Re-exported so a future migration to blocking trigger is a one-liner.
export { beforeUserCreated, REGION };
