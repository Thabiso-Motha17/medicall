import { beforeUserCreated } from "firebase-functions/v2/identity";
import { REGION } from "../config/env";
/**
 * Bootstrap a user document + default role claim immediately after Firebase
 * Auth creates the account. We use the v1 trigger here because v2 blocking
 * triggers (`beforeUserCreated`) require Identity Platform billing tier;
 * v1 onCreate works on Spark/Blaze without that and is fine for this use.
 */
export declare const onUserCreate: import("firebase-functions/v1").CloudFunction<import("firebase-admin/auth").UserRecord>;
export { beforeUserCreated, REGION };
