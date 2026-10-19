import { z } from "zod";

export const LatLng = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});

export const Specialty = z.enum([
  "general", "pediatric", "cardio", "derm", "neuro",
]);

export const RequestAppointmentInput = z.object({
  specialty: Specialty,
  address: z.object({
    line1: z.string().min(2).max(120),
    line2: z.string().max(120).optional(),
    city:  z.string().min(1).max(80),
    postalCode: z.string().min(1).max(20),
    countryCode: z.string().length(2),
    geo: LatLng,
  }),
  notes: z.string().max(2000).default(""),
});
export type RequestAppointmentInput = z.infer<typeof RequestAppointmentInput>;

export const AcceptAppointmentInput = z.object({
  appointmentId: z.string().min(1).max(64),
  expectedVersion: z.number().int().nonnegative(),
});

export const UpdateLocationInput = z.object({
  geo: LatLng,
  speedMps: z.number().min(0).max(200).nullable().optional(),
  headingDeg: z.number().min(0).lt(360).nullable().optional(),
  appointmentId: z.string().max(64).optional(),
});

export const CreatePaymentIntentInput = z.object({
  appointmentId: z.string().min(1).max(64),
});

export const VerifyDoctorInput = z.object({
  doctorUid: z.string().min(1).max(64),
  decision: z.enum(["verified", "rejected"]),
  reason: z.string().max(500).optional(),
});

export const SetRoleClaimInput = z.object({
  targetUid: z.string().min(1).max(64),
  role: z.enum(["patient", "doctor", "admin"]),
});
