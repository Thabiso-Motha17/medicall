# MediCall — React Native + Expo (SDK 54)

A polished, production-grade mobile UI for a doctor house-call app.

## Requirements

- Node.js 18+ (or Bun)
- **Expo Go (SDK 54)** on your iOS/Android device, OR Xcode / Android Studio

## Run

```bash
npm install        # or: bun install
npx expo start     # or: bunx expo start
```

Then:
- **Phone**: scan the QR with Expo Go (SDK 54)
- **iOS Simulator**: press `i`
- **Android Emulator**: press `a`
- **Web**: press `w`

If Metro caches a stale module: `npx expo start -c`

## Demo login

Tap through onboarding → on the Auth screen the form is pre-filled with a working demo account.

| Email                  | Password     |
| ---------------------- | ------------ |
| demo@medicall.app      | demo1234     |
| doctor@medicall.app    | doctor1234   |

You can also create new accounts via **Sign up** — they're stored locally on the device with `AsyncStorage`. To wire this to a real backend, replace `lib/auth.ts` with calls to Supabase / Firebase / your API; the screens only consume `signIn`, `signUp`, `signOut`, `getSession`.

## Project structure

```
app/                 # expo-router screens (file-based routing)
  index.tsx          # onboarding
  auth.tsx           # sign in / sign up (credential auth)
  (tabs)/            # bottom-tab layout: home, bookings, messages, profile
  doctor/[doctorId].tsx
  booking/[doctorId].tsx
  payment.tsx
  tracking.tsx       # live map mock
components/          # AppButton, AppInput, ScreenHeader, Atoms
theme/tokens.ts      # colors, spacing (8pt grid), typography, radii
lib/
  mockData.ts        # doctors, specialties
  auth.ts            # demo credential auth (AsyncStorage)
```

## SDK / dependency versions

This project targets **Expo SDK 54** (React Native 0.81, React 19). All Expo
package versions in `package.json` are pinned to the SDK 54-compatible ranges
recommended by Expo.
