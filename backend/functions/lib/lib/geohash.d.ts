import { GeoPoint } from "firebase-admin/firestore";
import type { Query, DocumentData } from "firebase-admin/firestore";
export declare const GEOHASH_PRECISION = 9;
export declare function hashFor(lat: number, lng: number): string;
export declare function pointFor(lat: number, lng: number): GeoPoint;
export declare function distanceMeters(a: {
    lat: number;
    lng: number;
}, b: {
    lat: number;
    lng: number;
}): number;
/**
 * Build the set of geohash range queries that cover a circle around a
 * center point. Caller must run each query and merge results.
 */
export declare function geohashQueriesAround(base: Query<DocumentData>, center: {
    lat: number;
    lng: number;
}, radiusMeters: number): Query<DocumentData>[];
