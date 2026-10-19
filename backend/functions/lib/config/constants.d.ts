export declare const COLLECTIONS: {
    readonly users: "users";
    readonly doctorProfiles: "doctorProfiles";
    readonly patientProfiles: "patientProfiles";
    readonly appointments: "appointments";
    readonly chatThreads: "chatThreads";
    readonly payments: "payments";
    readonly invoices: "invoices";
    readonly notifications: "notifications";
    readonly auditLogs: "auditLogs";
    readonly adminMetadata: "adminMetadata";
};
export declare const SUBCOLLECTIONS: {
    readonly devices: "devices";
    readonly paymentMethods: "paymentMethods";
    readonly addresses: "addresses";
    readonly availability: "availability";
    readonly documents: "documents";
    readonly statusEvents: "statusEvents";
    readonly locationPings: "locationPings";
    readonly messages: "messages";
    readonly participants: "participants";
    readonly items: "items";
};
export declare const DEFAULTS: {
    readonly appointmentTimeoutMinutes: 5;
    readonly arrivalTimeoutMinutes: 45;
    readonly locationPingTtlSeconds: 3600;
    readonly pageSize: 20;
    readonly maxDevicesPerUser: 10;
};
export declare const RATE_LIMITS: {
    readonly appointments_request: {
        readonly capacity: 5;
        readonly refillPerHour: 5;
    };
    readonly location_update: {
        readonly capacity: 12;
        readonly refillPerMinute: 12;
    };
    readonly auth_otp: {
        readonly capacity: 5;
        readonly refillPerWindow: 5;
        readonly windowMinutes: 15;
    };
};
