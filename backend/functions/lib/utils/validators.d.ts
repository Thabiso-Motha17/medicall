import { z } from "zod";
export declare const LatLng: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
}, {
    lat: number;
    lng: number;
}>;
export declare const Specialty: z.ZodEnum<["general", "pediatric", "cardio", "derm", "neuro"]>;
export declare const RequestAppointmentInput: z.ZodObject<{
    specialty: z.ZodEnum<["general", "pediatric", "cardio", "derm", "neuro"]>;
    address: z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        postalCode: z.ZodString;
        countryCode: z.ZodString;
        geo: z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        postalCode: string;
        countryCode: string;
        geo: {
            lat: number;
            lng: number;
        };
        line2?: string | undefined;
    }, {
        line1: string;
        city: string;
        postalCode: string;
        countryCode: string;
        geo: {
            lat: number;
            lng: number;
        };
        line2?: string | undefined;
    }>;
    notes: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    specialty: "general" | "pediatric" | "cardio" | "derm" | "neuro";
    address: {
        line1: string;
        city: string;
        postalCode: string;
        countryCode: string;
        geo: {
            lat: number;
            lng: number;
        };
        line2?: string | undefined;
    };
    notes: string;
}, {
    specialty: "general" | "pediatric" | "cardio" | "derm" | "neuro";
    address: {
        line1: string;
        city: string;
        postalCode: string;
        countryCode: string;
        geo: {
            lat: number;
            lng: number;
        };
        line2?: string | undefined;
    };
    notes?: string | undefined;
}>;
export type RequestAppointmentInput = z.infer<typeof RequestAppointmentInput>;
export declare const AcceptAppointmentInput: z.ZodObject<{
    appointmentId: z.ZodString;
    expectedVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    appointmentId: string;
    expectedVersion: number;
}, {
    appointmentId: string;
    expectedVersion: number;
}>;
export declare const UpdateLocationInput: z.ZodObject<{
    geo: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>;
    speedMps: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    headingDeg: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    appointmentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    geo: {
        lat: number;
        lng: number;
    };
    appointmentId?: string | undefined;
    speedMps?: number | null | undefined;
    headingDeg?: number | null | undefined;
}, {
    geo: {
        lat: number;
        lng: number;
    };
    appointmentId?: string | undefined;
    speedMps?: number | null | undefined;
    headingDeg?: number | null | undefined;
}>;
export declare const CreatePaymentIntentInput: z.ZodObject<{
    appointmentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    appointmentId: string;
}, {
    appointmentId: string;
}>;
export declare const VerifyDoctorInput: z.ZodObject<{
    doctorUid: z.ZodString;
    decision: z.ZodEnum<["verified", "rejected"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    doctorUid: string;
    decision: "verified" | "rejected";
    reason?: string | undefined;
}, {
    doctorUid: string;
    decision: "verified" | "rejected";
    reason?: string | undefined;
}>;
export declare const SetRoleClaimInput: z.ZodObject<{
    targetUid: z.ZodString;
    role: z.ZodEnum<["patient", "doctor", "admin"]>;
}, "strip", z.ZodTypeAny, {
    role: "patient" | "doctor" | "admin";
    targetUid: string;
}, {
    role: "patient" | "doctor" | "admin";
    targetUid: string;
}>;
