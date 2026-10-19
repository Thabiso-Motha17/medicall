"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetRoleClaimInput = exports.VerifyDoctorInput = exports.CreatePaymentIntentInput = exports.UpdateLocationInput = exports.AcceptAppointmentInput = exports.RequestAppointmentInput = exports.Specialty = exports.LatLng = void 0;
const zod_1 = require("zod");
exports.LatLng = zod_1.z.object({
    lat: zod_1.z.number().gte(-90).lte(90),
    lng: zod_1.z.number().gte(-180).lte(180),
});
exports.Specialty = zod_1.z.enum([
    "general", "pediatric", "cardio", "derm", "neuro",
]);
exports.RequestAppointmentInput = zod_1.z.object({
    specialty: exports.Specialty,
    address: zod_1.z.object({
        line1: zod_1.z.string().min(2).max(120),
        line2: zod_1.z.string().max(120).optional(),
        city: zod_1.z.string().min(1).max(80),
        postalCode: zod_1.z.string().min(1).max(20),
        countryCode: zod_1.z.string().length(2),
        geo: exports.LatLng,
    }),
    notes: zod_1.z.string().max(2000).default(""),
});
exports.AcceptAppointmentInput = zod_1.z.object({
    appointmentId: zod_1.z.string().min(1).max(64),
    expectedVersion: zod_1.z.number().int().nonnegative(),
});
exports.UpdateLocationInput = zod_1.z.object({
    geo: exports.LatLng,
    speedMps: zod_1.z.number().min(0).max(200).nullable().optional(),
    headingDeg: zod_1.z.number().min(0).lt(360).nullable().optional(),
    appointmentId: zod_1.z.string().max(64).optional(),
});
exports.CreatePaymentIntentInput = zod_1.z.object({
    appointmentId: zod_1.z.string().min(1).max(64),
});
exports.VerifyDoctorInput = zod_1.z.object({
    doctorUid: zod_1.z.string().min(1).max(64),
    decision: zod_1.z.enum(["verified", "rejected"]),
    reason: zod_1.z.string().max(500).optional(),
});
exports.SetRoleClaimInput = zod_1.z.object({
    targetUid: zod_1.z.string().min(1).max(64),
    role: zod_1.z.enum(["patient", "doctor", "admin"]),
});
//# sourceMappingURL=validators.js.map