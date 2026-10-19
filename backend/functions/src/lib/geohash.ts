/**
 * Geohash helpers — wraps `geofire-common` with our preferred precision
 * and a typed bounding-box query helper for Firestore.
 */
import * as gf from "geofire-common";
import { GeoPoint } from "firebase-admin/firestore";
import type { Query, DocumentData } from "firebase-admin/firestore";

export const GEOHASH_PRECISION = 9;

export function hashFor(lat: number, lng: number): string {
  return gf.geohashForLocation([lat, lng], GEOHASH_PRECISION);
}

export function pointFor(lat: number, lng: number): GeoPoint {
  return new GeoPoint(lat, lng);
}

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  return gf.distanceBetween([a.lat, a.lng], [b.lat, b.lng]) * 1000;
}

/**
 * Build the set of geohash range queries that cover a circle around a
 * center point. Caller must run each query and merge results.
 */
export function geohashQueriesAround(
  base: Query<DocumentData>,
  center: { lat: number; lng: number },
  radiusMeters: number,
): Query<DocumentData>[] {
  const bounds = gf.geohashQueryBounds([center.lat, center.lng], radiusMeters);
  return bounds.map(([start, end]) =>
    base.orderBy("geohash").startAt(start).endAt(end),
  );
}
