export const COLLECTIONS = {
  users:            "users",
  doctorProfiles:   "doctorProfiles",
  patientProfiles:  "patientProfiles",
  appointments:     "appointments",
  chatThreads:      "chatThreads",
  payments:         "payments",
  invoices:         "invoices",
  notifications:    "notifications",
  auditLogs:        "auditLogs",
  adminMetadata:    "adminMetadata",
} as const;

export const SUBCOLLECTIONS = {
  devices:        "devices",
  paymentMethods: "paymentMethods",
  addresses:      "addresses",
  availability:   "availability",
  documents:      "documents",
  statusEvents:   "statusEvents",
  locationPings:  "locationPings",
  messages:       "messages",
  participants:   "participants",
  items:          "items",
} as const;

export const DEFAULTS = {
  appointmentTimeoutMinutes: 5,    // requested → auto-cancel
  arrivalTimeoutMinutes:    45,    // accepted → auto-cancel if not arrived
  locationPingTtlSeconds:   3600,  // 1h
  pageSize:                 20,
  maxDevicesPerUser:        10,
} as const;

export const RATE_LIMITS = {
  appointments_request: { capacity: 5,  refillPerHour: 5  },
  location_update:      { capacity: 12, refillPerMinute: 12 },
  auth_otp:             { capacity: 5,  refillPerWindow: 5,  windowMinutes: 15 },
} as const;
