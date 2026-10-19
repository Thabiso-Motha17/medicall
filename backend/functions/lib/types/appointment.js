"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_TRANSITIONS = void 0;
/** Allowed status transitions, enforced server-side. */
exports.ALLOWED_TRANSITIONS = {
    requested: ["accepted", "cancelled"],
    accepted: ["doctor_arriving", "cancelled"],
    doctor_arriving: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};
//# sourceMappingURL=appointment.js.map