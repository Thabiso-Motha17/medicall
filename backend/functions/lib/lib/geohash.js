"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEOHASH_PRECISION = void 0;
exports.hashFor = hashFor;
exports.pointFor = pointFor;
exports.distanceMeters = distanceMeters;
exports.geohashQueriesAround = geohashQueriesAround;
/**
 * Geohash helpers — wraps `geofire-common` with our preferred precision
 * and a typed bounding-box query helper for Firestore.
 */
const gf = __importStar(require("geofire-common"));
const firestore_1 = require("firebase-admin/firestore");
exports.GEOHASH_PRECISION = 9;
function hashFor(lat, lng) {
    return gf.geohashForLocation([lat, lng], exports.GEOHASH_PRECISION);
}
function pointFor(lat, lng) {
    return new firestore_1.GeoPoint(lat, lng);
}
function distanceMeters(a, b) {
    return gf.distanceBetween([a.lat, a.lng], [b.lat, b.lng]) * 1000;
}
/**
 * Build the set of geohash range queries that cover a circle around a
 * center point. Caller must run each query and merge results.
 */
function geohashQueriesAround(base, center, radiusMeters) {
    const bounds = gf.geohashQueryBounds([center.lat, center.lng], radiusMeters);
    return bounds.map(([start, end]) => base.orderBy("geohash").startAt(start).endAt(end));
}
//# sourceMappingURL=geohash.js.map