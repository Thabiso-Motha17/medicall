# MediCall — Firebase Backend (Production Architecture)

Enterprise-grade Firebase backend for a Doctor House Call mobile application
(React Native + Expo Router). Designed by senior backend engineering standards
for a funded health-tech startup.

> **Stack:** Firebase Auth · Firestore · Storage · Cloud Functions (TS) · FCM ·
> Security Rules · Emulator Suite · Stripe-ready · GeoQueries · RBAC

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Repository Layout](#2-repository-layout)
3. [Firestore Data Model](#3-firestore-data-model)
4. [Indexes](#4-indexes)
5. [Security Rules Strategy](#5-security-rules-strategy)
6. [Cloud Functions Architecture](#6-cloud-functions-architecture)
7. [Authentication & RBAC](#7-authentication--rbac)
8. [Realtime Tracking & Geoqueries](#8-realtime-tracking--geoqueries)
9. [Payments (Stripe-ready)](#9-payments-stripe-ready)
10. [Notifications (FCM + Expo)](#10-notifications-fcm--expo)
11. [Chat](#11-chat)
12. [Storage](#12-storage)
13. [Cost & Performance Optimization](#13-cost--performance-optimization)
14. [Observability, Audit & Abuse Prevention](#14-observability-audit--abuse-prevention)
15. [Local Dev — Emulator Suite](#15-local-dev--emulator-suite)
16. [CI/CD & Deployment](#16-cicd--deployment)
17. [Common Firebase Mistakes (and how we avoid them)](#17-common-firebase-mistakes)
18. [Scaling to 100k+ Users](#18-scaling)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Expo / React Native App                       │
│  (Patient · Doctor · Admin web)                                      │
└──────────────┬───────────────────────────────┬───────────────────────┘
               │ Firebase SDK (modular v9+)    │ HTTPS Callable / FCM
               ▼                               ▼
┌──────────────────────────┐      ┌────────────────────────────────────┐
│  Firebase Auth           │      │  Cloud Functions (TS, 2nd gen)     │
│  - email/pwd, Google,    │      │  - triggers (Firestore/Auth/Storage)│
│    phone                 │      │  - callable (matching, payments)    │
│  - custom claims (role)  │      │  - HTTP (Stripe webhooks)           │
└────────┬─────────────────┘      │  - scheduled (cleanup, ETAs)        │
         │                        └─────────┬──────────────────────────┘
         │ ID token + claims                │
         ▼                                  ▼
┌──────────────────────────┐      ┌────────────────────────────────────┐
│  Firestore (multi-region)│◄────►│  Cloud Storage (per-role paths)    │
│  - feature collections   │      │  - documents, prescriptions, media │
│  - subcollections        │      └────────────────────────────────────┘
│  - geohash queries       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  FCM + Expo Push         │
└──────────────────────────┘
```

**Design principles**

- **Security first.** No client trusts another client. Sensitive writes
  (role assignment, doctor verification, appointment status transitions,
  payment captures) only happen server-side via Cloud Functions or are
  enforced by tight Security Rules with custom claims.
- **Feature-based modules**, not layered monolith. Each domain
  (`appointments`, `payments`, `chat`, `users`) ships its triggers,
  services, and DTOs together.
- **Strict TypeScript** across the entire backend, with shared types in
  `functions/src/types` reusable by the mobile app via a published
  `@medicall/types` package (or git submodule).
- **Cost-aware**. Avoid hot documents, fan-out via batched writes,
  denormalize for read paths, paginate everything, and use aggregation
  fields instead of `count()` queries on hot paths.
- **Mobile-first**. Realtime listeners are scoped narrowly; large lists
  are paginated; presence/location updates are throttled.

---

## 2. Repository Layout

```
medicall-backend/
├── firebase.json                  # emulator + deploy config
├── .firebaserc                    # project aliases (dev / staging / prod)
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.cjs
│   └── src/
│       ├── index.ts               # function exports (tree-shakeable)
│       ├── config/
│       │   ├── env.ts             # zod-validated env
│       │   ├── firebase.ts        # admin SDK singleton
│       │   └── constants.ts
│       ├── types/                 # shared DTOs / domain models
│       │   ├── user.ts
│       │   ├── appointment.ts
│       │   ├── payment.ts
│       │   ├── chat.ts
│       │   └── index.ts
│       ├── lib/                   # cross-cutting helpers
│       │   ├── geohash.ts
│       │   ├── logger.ts
│       │   ├── errors.ts
│       │   ├── result.ts
│       │   └── rateLimiter.ts
│       ├── middleware/
│       │   ├── requireAuth.ts
│       │   ├── requireRole.ts
│       │   └── withRateLimit.ts
│       ├── services/              # business logic, no Firebase imports leak
│       │   ├── userService.ts
│       │   ├── appointmentService.ts
│       │   ├── doctorMatchingService.ts
│       │   ├── paymentService.ts
│       │   ├── notificationService.ts
│       │   └── auditService.ts
│       ├── triggers/              # Firestore / Auth / Storage triggers
│       │   ├── onUserCreate.ts
│       │   ├── onAppointmentWrite.ts
│       │   ├── onAppointmentStatusChange.ts
│       │   ├── onChatMessageCreate.ts
│       │   └── onDoctorDocumentUpload.ts
│       ├── callable/              # client-invoked RPCs
│       │   ├── requestAppointment.ts
│       │   ├── acceptAppointment.ts
│       │   ├── updateDoctorLocation.ts
│       │   ├── createPaymentIntent.ts
│       │   └── verifyDoctor.ts
│       ├── http/                  # webhooks
│       │   └── stripeWebhook.ts
│       ├── scheduled/             # cron jobs
│       │   ├── cleanupStaleAppointments.ts
│       │   ├── recomputeDoctorRatings.ts
│       │   └── archiveOldChats.ts
│       └── utils/
│           ├── validators.ts      # zod schemas
│           └── tx.ts              # transaction helpers
├── scripts/
│   ├── seed.ts                    # emulator seeding
│   └── setClaims.ts               # one-off role assignment (admin)
└── docs/
    ├── data-model.md
    ├── security-rules.md
    └── runbook.md
```

---

## 3. Firestore Data Model

### Naming conventions

- Collections: **plural, camelCase** (`users`, `appointments`,
  `chatThreads`).
- Document IDs: **UUID v4** for entities, **composite keys** only when
  natural and sortable (`{patientId}_{doctorId}` for chat threads).
- Field names: **camelCase**, timestamps end in `At`
  (`createdAt`, `acceptedAt`).
- Money fields: stored as **integer minor units** (`priceCents: 8900`),
  never floats. Currency stored alongside (`currency: "USD"`).
- Enums: **string literal unions**, lowercase snake_case
  (`"in_progress"`).

### Top-level collections

| Collection           | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `users/{uid}`        | Profile (shared fields). Role lives in custom claims AND mirrored here for queryability. |
| `doctorProfiles/{uid}` | Doctor-specific data (license, specialty, ratings, geohash). |
| `patientProfiles/{uid}` | Patient-specific (addresses, emergency contacts). |
| `appointments/{id}`  | Appointment lifecycle.                               |
| `chatThreads/{id}`   | One per appointment (or 1:1 patient/doctor).         |
| `payments/{id}`      | Payment intents + captures.                          |
| `invoices/{id}`      | Immutable billing records.                           |
| `notifications/{uid}/items/{id}` | In-app notification feed.                |
| `auditLogs/{id}`     | Append-only admin/security events.                   |
| `adminMetadata/{id}` | Internal config (feature flags, kill switches).      |

### Subcollections

| Path                                            | Purpose                                  |
| ----------------------------------------------- | ---------------------------------------- |
| `users/{uid}/devices/{deviceId}`                | FCM/Expo push tokens                     |
| `users/{uid}/paymentMethods/{pmId}`             | Tokenized cards (Stripe ids only)        |
| `patientProfiles/{uid}/addresses/{id}`          | Saved addresses                          |
| `doctorProfiles/{uid}/availability/{dayId}`     | Weekly availability windows              |
| `doctorProfiles/{uid}/documents/{docId}`        | License/diploma metadata (file in Storage) |
| `appointments/{id}/statusEvents/{id}`           | Immutable status history (audit)         |
| `appointments/{id}/locationPings/{ts}`          | TTL-cleaned doctor location stream       |
| `chatThreads/{id}/messages/{id}`                | Messages                                 |
| `chatThreads/{id}/participants/{uid}`           | Per-user unread counts, lastReadAt       |

### Schemas (excerpt — full TS in `functions/src/types/`)

```ts
// User (shared)
type UserRole = "patient" | "doctor" | "admin";
interface User {
  uid: string;
  role: UserRole;            // mirrored from custom claims
  email: string | null;
  phone: string | null;
  displayName: string;
  photoUrl: string | null;
  locale: string;            // "en-US"
  createdAt: Timestamp;
  updatedAt: Timestamp;
  disabled: boolean;
  // denormalized for fast UI
  unreadNotifications: number;
}

// Doctor profile
interface DoctorProfile {
  uid: string;
  specialties: string[];                 // ["general", "pediatric"]
  licenseNumber: string;                 // PII — admin/self read only
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedAt: Timestamp | null;
  experienceYears: number;
  consultationFeeCents: number;
  currency: string;                      // "USD"
  bio: string;
  languages: string[];
  // ratings (denormalized, recomputed by scheduled job)
  ratingAvg: number;                     // 0..5
  ratingCount: number;
  // location & availability
  isOnline: boolean;
  isAcceptingRequests: boolean;
  lastLocation: GeoPoint | null;
  geohash: string | null;                // for queries
  lastSeenAt: Timestamp | null;
}

// Appointment
type AppointmentStatus =
  | "requested"
  | "accepted"
  | "doctor_arriving"
  | "in_progress"
  | "completed"
  | "cancelled";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string | null;               // null until matched
  specialty: string;
  status: AppointmentStatus;
  // denormalized minimal user info — avoid extra reads in lists
  patientSummary: { displayName: string; photoUrl: string | null };
  doctorSummary:  { displayName: string; photoUrl: string | null } | null;
  // location (patient address at request time)
  address: { line1: string; city: string; geo: GeoPoint; geohash: string };
  // pricing snapshot
  priceCents: number;
  currency: string;
  paymentId: string | null;
  // ETA / timeline
  requestedAt: Timestamp;
  acceptedAt: Timestamp | null;
  arrivingAt: Timestamp | null;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  cancelledAt: Timestamp | null;
  cancellationReason: string | null;
  // free-text reason / symptoms
  notes: string;
  // server-controlled flags
  version: number;                       // optimistic concurrency
}
```

### Why these choices

- **Doctor and patient profiles split** from `users` so security rules
  can keep `users` broadly readable (display name + photo) without
  leaking license numbers, addresses, or medical notes.
- **Appointment denormalizes** display name + photo to render lists
  with **one read per appointment**, not three.
- **`statusEvents` subcollection** is immutable and forms the audit
  trail; the parent `appointments` doc holds only the current state.
- **`locationPings` subcollection** isolates high-write data so the
  parent appointment doc isn't rewritten on every GPS tick (avoids
  Firestore's 1 write/sec soft limit per doc and reduces listener
  churn).

---

## 4. Indexes

See `firestore.indexes.json`. Highlights:

| Query                                                              | Index                                                       |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| Patient's appointments by status, newest first                     | `appointments` (`patientId` ASC, `status` ASC, `requestedAt` DESC) |
| Doctor's incoming requests                                         | `appointments` (`doctorId` ASC, `status` ASC, `requestedAt` DESC) |
| Doctors by specialty + online + geohash range                      | `doctorProfiles` (`specialties` ARRAY, `isAcceptingRequests` ASC, `geohash` ASC) |
| Verified doctors for admin                                         | `doctorProfiles` (`verificationStatus` ASC, `createdAt` DESC) |
| Audit logs by actor                                                | `auditLogs` (`actorUid` ASC, `createdAt` DESC)              |

> **Rule of thumb:** every query you run in production must have either
> an automatic single-field index OR an explicit composite index.
> Firestore will tell you in the error — commit those JSON entries to
> the repo so they deploy with the code.

---

## 5. Security Rules Strategy

Three pillars:

1. **Custom claims** (`role`, `verified`) set server-side via
   `setRoleClaim` callable. Claims are the source of truth for
   authorization in rules — never trust a `role` field on a doc the
   user can write.
2. **Per-collection helper functions** (`isOwner`, `hasRole`,
   `isAdmin`, `isVerifiedDoctor`) keep rules DRY and auditable.
3. **Server-only writes** for sensitive fields. Status transitions on
   appointments, payment captures, and verification are denied to
   clients and only Cloud Functions (admin SDK bypasses rules) can
   write them.

See `firestore.rules` and `storage.rules` for the full implementation.

---

## 6. Cloud Functions Architecture

**2nd gen** functions, region-pinned (`us-central1` example), with
typed params. We expose three categories:

- **Triggers** — react to Firestore/Auth/Storage events.
  - `onUserCreate` → bootstrap profile, set default role claim.
  - `onAppointmentWrite` → fan out notifications, append `statusEvents`,
    update doctor availability.
  - `onChatMessageCreate` → increment unread counts, push notify.
  - `onDoctorDocumentUpload` → kick off OCR/verification queue.
- **Callable** — `httpsCallable` from the app, fully typed via shared
  DTOs.
  - `requestAppointment` (patient) — runs matching, creates
    appointment in a transaction.
  - `acceptAppointment` (doctor) — atomic claim with version check.
  - `updateDoctorLocation` (doctor) — throttled 1/5s, writes geohash.
  - `createPaymentIntent` (patient) — talks to Stripe.
  - `verifyDoctor` (admin) — sets claim + audit log.
- **HTTP** — Stripe webhook (signature verified).
- **Scheduled** — cleanup, rating recompute, chat archival.

Each function:

```
[Callable] requestAppointment
    ├─ middleware: requireAuth → requireRole("patient") → withRateLimit
    ├─ validate input (zod)
    ├─ service.appointmentService.requestAppointment(input, ctx)
    └─ return DTO (never raw Firestore docs)
```

Services are **pure logic + repository calls**; triggers are **thin**
and delegate to services — same code path is reusable.

---

## 7. Authentication & RBAC

- **Sign-in methods**: email/password, Google, phone (structure ready;
  enable in console). Apple is supported by adding the provider in the
  client and console — no backend change.
- **Role assignment**: on `auth.user().onCreate`, we set
  `role: "patient"` claim by default. Admin role is granted only by
  another admin via the `setRoleClaim` callable (audited).
- **Session persistence**: client uses `getReactNativePersistence`
  with AsyncStorage (Expo SDK 54 compatible).
- **Token refresh on role change**: client must call
  `await user.getIdToken(true)` after role-changing flows. The server
  function returns `{ refreshToken: true }` so the app knows.

---

## 8. Realtime Tracking & Geoqueries

- Doctor opens app & toggles **Available** → client subscribes to a
  callable heartbeat (`updateDoctorLocation`) at **5s** intervals
  while moving (and `15s` while stationary).
- Server writes:
  - `doctorProfiles/{uid}.lastLocation`, `geohash`, `lastSeenAt`
    (for matching).
  - `appointments/{id}/locationPings/{ts}` only when the doctor has
    an active appointment (for the patient's live map).
- Patient subscribes to **only the active appointment's** `locationPings`
  subcollection ordered by ts desc, limited to last 1 ping (or to the
  parent appointment's `lastDoctorLocation` denormalized field —
  cheaper).
- **Geoqueries**: we store a 9-char geohash and query a bounding box
  of geohash prefixes (Firebase's recommended pattern via
  `geofire-common`). Matching service in
  `services/doctorMatchingService.ts` filters by specialty +
  `isAcceptingRequests` + `verificationStatus == "verified"` +
  geohash range, then sorts by distance client-side.
- **TTL policy** on `locationPings` (1 hour) configured in Firestore
  console — auto-purges old pings, keeps storage bill flat.

---

## 9. Payments (Stripe-ready)

Architecture is provider-agnostic but wired for Stripe.

```
patient
  │ createPaymentIntent (callable)
  ▼
paymentService.createIntent(appointmentId)
  │  → idempotency key: appointmentId
  │  → Stripe API (server-side, secret in Secret Manager)
  │  → write payments/{id} { status: "requires_action", ... }
  ▼
client confirms with Stripe SDK (PaymentSheet)
  ▼
Stripe webhook → http/stripeWebhook
  ├─ verify signature (Stripe-Signature header)
  ├─ on payment_intent.succeeded → update payments/{id}, appointments/{id}.paymentId
  ├─ generate immutable invoices/{id}
  └─ notify patient + doctor
```

- Card data **never** touches our backend; we only store Stripe ids.
- All money is integer cents + currency.
- Refund flow mirrors capture (callable + webhook).

---

## 10. Notifications (FCM + Expo)

- Devices register with `users/{uid}/devices/{deviceId}` storing
  `{ fcmToken, expoPushToken, platform, lastSeenAt }`.
- `notificationService.send(uid, payload)`:
  1. Loads device tokens (cap 10 most recent per user).
  2. Sends via FCM **for native data messages** (silent, used for
     appointment state) AND via Expo Push for user-visible alerts on
     Expo-managed builds. Single helper, two transports.
  3. Writes `notifications/{uid}/items/{id}` for the in-app feed
     and increments `users/{uid}.unreadNotifications`.
- Failed tokens (`messaging/registration-token-not-registered`) are
  pruned automatically.

---

## 11. Chat

- One `chatThreads/{id}` per appointment (id =
  `appt_{appointmentId}`). Out-of-appointment chats use
  `dm_{sortedUidA}_{sortedUidB}`.
- `messages` subcollection holds `{ senderId, type, text, mediaUrl,
  createdAt }`. Media uploads first land in Storage, then a message is
  created referencing the storage path (rules verify the uploader
  matches the sender).
- `participants/{uid}` holds `unreadCount`, `lastReadAt`. Unread
  counts maintained by `onChatMessageCreate` trigger (atomic
  increment), zeroed by a `markRead` callable.
- For lists, we denormalize `lastMessagePreview`, `lastMessageAt`,
  `lastSenderId` on the parent thread doc so inbox renders with
  one query.

---

## 12. Storage

Bucket layout (single bucket, path-scoped rules):

```
/users/{uid}/avatar/{file}                       — public read, owner write
/doctors/{uid}/documents/{file}                  — admin + owner read, owner write, server verify
/appointments/{appointmentId}/prescriptions/{file} — patient + assigned doctor read, doctor write
/chat/{threadId}/{senderUid}/{file}              — thread participants read, sender write
```

Rules enforce `request.auth.uid` against the path segment and check
file size + content type. Large files (>5MB) require a callable to
generate a signed upload URL with embedded constraints.

---

## 13. Cost & Performance Optimization

- **Denormalize for read paths.** Lists carry the minimum needed to
  render — never trigger N+1 reads from a list view.
- **Aggregation fields, not `count()`.** Maintain `ratingCount`,
  `unreadCount` via `FieldValue.increment` in triggers.
- **TTL policies** on `locationPings`, `auditLogs` (>180 days),
  `notifications` (>90 days).
- **Pagination everywhere.** Default `limit(20)` + `startAfter` cursor.
  No `.get()` without a limit on collections that grow.
- **Listeners are scoped narrowly.** Subscribe to single docs or
  collections with `where` + `limit`. Never listen to a top-level
  collection without filters.
- **Throttle high-frequency writes** (location, typing indicators)
  on the client AND the callable (server-side rate limiter as second
  line).
- **Batch fan-outs** (notifications, status events) in a single
  `WriteBatch` or transaction.
- **Cache custom claims on the client**; only force refresh on
  role change.

---

## 14. Observability, Audit & Abuse Prevention

- **Structured logging** via `lib/logger.ts` wrapping
  `firebase-functions/logger` with severity + correlation id (request
  id from callable context).
- **Audit log** (`auditLogs/{id}`) for: role change, doctor
  verification, account suspend, appointment force-cancel, payment
  refund. Admin SDK only writes.
- **Crash & error monitoring**: Sentry SDK in functions
  (`@sentry/node`) initialized once in `config/firebase.ts`. Errors
  caught at middleware boundary, tagged with uid + function name.
- **Rate limiting**: token-bucket implementation in
  `lib/rateLimiter.ts` backed by a Firestore doc per `(uid,
  bucket)`. Buckets: `appointments_request: 5/hour`,
  `location_update: 12/min`, `auth_otp: 5/15min`.
- **Abuse prevention**:
  - App Check enforced on all callable functions (`enforceAppCheck:
    true`).
  - Email verification required before booking.
  - Phone re-verification on suspicious device change.
  - Admin "kill switch" feature flags in `adminMetadata/featureFlags`.

---

## 15. Local Dev — Emulator Suite

`firebase.json` wires Auth, Firestore, Functions, Storage, and Pub/Sub
emulators with deterministic ports. `scripts/seed.ts` creates demo
patients, doctors, and appointments against the emulator so the mobile
app gets a realistic dataset locally.

```bash
cd functions && npm install
npm --prefix functions run build:watch &
firebase emulators:start --import=./.seed --export-on-exit
npx ts-node scripts/seed.ts   # one-time
```

The Expo app points to the emulators when `EXPO_PUBLIC_USE_EMULATORS=1`
(see `lib/firebase.ts` in the mobile project — already wired in earlier
turns).

---

## 16. CI/CD & Deployment

- **Project aliases** in `.firebaserc`: `dev`, `staging`, `prod`.
- **GitHub Actions** (suggested):
  - PR: lint + typecheck + `firebase emulators:exec "npm test"`.
  - Merge to `main`: deploy to `staging`.
  - Tag `v*`: deploy to `prod` with manual approval.
- **Secrets** via `firebase functions:secrets:set STRIPE_SECRET_KEY`;
  consumed in functions with `defineSecret`.
- **Zero-downtime**: deploy rules + indexes first, then functions.
  Index builds are async — gate breaking query changes behind a
  feature flag until indexes report `READY`.

---

## 17. Common Firebase Mistakes (and how we avoid them)

| Mistake                                              | Our mitigation                                          |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Storing role on user doc and trusting it in rules    | Role lives in **custom claims**; doc field is mirror only. |
| Using floats for money                               | Integer cents + currency.                               |
| Listening to a whole collection in a screen          | Always `where` + `limit`; cursor pagination.            |
| Writing GPS pings into the parent doc                | Subcollection + TTL.                                    |
| Counting with `count()` on hot read paths            | Maintained aggregates via triggers.                     |
| Missing composite indexes discovered in production   | Indexes committed to repo, required by CI.              |
| Doing transactions across many docs                  | Keep TX <500 ops; otherwise use batched fan-out + queue. |
| Webhook handlers that aren't idempotent              | Idempotency keyed by Stripe event id.                   |
| Putting service account JSON in the repo             | Secret Manager + workload identity in CI.               |
| Functions cold-start storms                          | Min instances on hot callables (`requestAppointment`).  |

---

## 18. Scaling

- **Firestore**: shards naturally; the only ceiling is per-doc 1 w/s.
  Our hot docs (doctor profile, appointment) write at human pace;
  high-frequency data (locations, chat) lives in subcollections.
- **Functions**: 2nd gen scales to thousands of concurrent instances;
  pin `min_instances=1` only on latency-critical callables.
- **Realtime fan-out**: for >10k concurrent listeners on a single
  collection, switch that collection to **Realtime Database** (better
  fan-out economics) — our boundary is clean enough to swap one
  feature without touching others.
- **Multi-region**: keep Firestore in `nam5`/`eur3` multi-region
  from day one; functions can be regionalized per market later.

---

## License

Proprietary — © MediCall.
