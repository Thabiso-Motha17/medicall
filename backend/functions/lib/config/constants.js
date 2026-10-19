"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.DEFAULTS = exports.SUBCOLLECTIONS = exports.COLLECTIONS = void 0;
exports.COLLECTIONS = {
    users: "users",
    doctorProfiles: "doctorProfiles",
    patientProfiles: "patientProfiles",
    appointments: "appointments",
    chatThreads: "chatThreads",
    payments: "payments",
    invoices: "invoices",
    notifications: "notifications",
    auditLogs: "auditLogs",
    adminMetadata: "adminMetadata",
};
exports.SUBCOLLECTIONS = {
    devices: "devices",
    paymentMethods: "paymentMethods",
    addresses: "addresses",
    availability: "availability",
    documents: "documents",
    statusEvents: "statusEvents",
    locationPings: "locationPings",
    messages: "messages",
    participants: "participants",
    items: "items",
};
exports.DEFAULTS = {
    appointmentTimeoutMinutes: 5, // requested → auto-cancel
    arrivalTimeoutMinutes: 45, // accepted → auto-cancel if not arrived
    locationPingTtlSeconds: 3600, // 1h
    pageSize: 20,
    maxDevicesPerUser: 10,
};
exports.RATE_LIMITS = {
    appointments_request: { capacity: 5, refillPerHour: 5 },
    location_update: { capacity: 12, refillPerMinute: 12 },
    auth_otp: { capacity: 5, refillPerWindow: 5, windowMinutes: 15 },
};
//# sourceMappingURL=constants.js.map