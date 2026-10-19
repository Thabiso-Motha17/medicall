import type { Timestamp } from "firebase-admin/firestore";

export type PaymentStatus =
  | "requires_action"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  provider: "stripe";
  providerIntentId: string;
  providerChargeId: string | null;
  failureReason: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Invoice {
  id: string;
  paymentId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  amountCents: number;
  currency: string;
  pdfStoragePath: string | null;
  issuedAt: Timestamp;
}
