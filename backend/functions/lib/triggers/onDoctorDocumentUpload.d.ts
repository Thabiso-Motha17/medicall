/**
 * When a doctor uploads a verification document, register it in their
 * documents subcollection so admins can review. The actual file stays in
 * Storage; we only persist metadata here.
 */
export declare const onDoctorDocumentUpload: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/storage").StorageEvent>;
