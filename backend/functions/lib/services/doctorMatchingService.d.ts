import type { DoctorProfile } from "../types/user";
export interface MatchInput {
    specialty: string;
    center: {
        lat: number;
        lng: number;
    };
    radiusMeters?: number;
    limit?: number;
}
export interface DoctorCandidate {
    doctor: DoctorProfile;
    distanceMeters: number;
    score: number;
}
export declare function findCandidateDoctors(input: MatchInput): Promise<DoctorCandidate[]>;
