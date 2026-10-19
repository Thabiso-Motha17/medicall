import type { Timestamp, GeoPoint } from "firebase-admin/firestore";
export type UserRole = "patient" | "doctor" | "admin";
export interface User {
    uid: string;
    role: UserRole;
    email: string | null;
    phone: string | null;
    displayName: string;
    photoUrl: string | null;
    locale: string;
    disabled: boolean;
    unreadNotifications: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface Device {
    deviceId: string;
    fcmToken: string | null;
    expoPushToken: string | null;
    platform: "ios" | "android" | "web";
    appVersion: string;
    lastSeenAt: Timestamp;
}
export type VerificationStatus = "pending" | "verified" | "rejected";
export interface DoctorProfile {
    uid: string;
    specialties: string[];
    licenseNumber: string;
    verificationStatus: VerificationStatus;
    verifiedAt: Timestamp | null;
    experienceYears: number;
    consultationFeeCents: number;
    currency: string;
    bio: string;
    languages: string[];
    ratingAvg: number;
    ratingCount: number;
    isOnline: boolean;
    isAcceptingRequests: boolean;
    lastLocation: GeoPoint | null;
    geohash: string | null;
    lastSeenAt: Timestamp | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface PatientProfile {
    uid: string;
    emergencyContacts: Array<{
        name: string;
        phone: string;
        relation: string;
    }>;
    medicalNotes: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
