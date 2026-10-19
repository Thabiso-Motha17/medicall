import { onSchedule } from "firebase-functions/v2/scheduler";
import { REGION } from "../config/env";
import * as appointmentService from "../services/appointmentService";
import { logger } from "../lib/logger";

/** Auto-cancel `requested` appointments older than the configured timeout. */
export const cleanupStaleAppointments = onSchedule(
  { region: REGION, schedule: "every 1 minutes", timeoutSeconds: 60, memory: "256MiB" },
  async () => {
    try {
      const n = await appointmentService.autoCancelStaleRequests();
      if (n > 0) logger.info("auto-cancelled stale appointments", { fn: "cleanupStaleAppointments" }, { count: n });
    } catch (err) {
      logger.error("cleanupStaleAppointments failed", err, { fn: "cleanupStaleAppointments" });
    }
  },
);
