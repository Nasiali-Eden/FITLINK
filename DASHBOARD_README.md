# Initial provider dashboard

## Scope and route

The first dashboard is available at `/dashboard`. It is a read-only, auth-aware overview for FitLink trainers, gyms, academies, and wellness providers. It focuses on booking totals, active bookings, completed booking value, reputation, recent bookings, approval, plan, and basic profile completeness.

## Current data contract

The page listens to Firebase Authentication, reads `users/{uid}` for `role` and `providerId`, then reads `providers/{providerId}`. It subscribes to `bookings` where `providerOwnerUid == uid`; results are sorted by `createdAt` in the browser and the latest five are shown. Booking value uses `amountKes`. Active means `pending` or `confirmed`; completed value includes only `completed` bookings. Profile completion checks `name`, `phone`, `location`, `bio`, and `photo`.

All subscriptions are cleaned up when auth changes or the page unmounts. No additional Firestore composite index is required.

## Supported states

- Loading, load error, and retry
- Signed out, signed-in client/non-provider, and missing provider profile
- Provider with no bookings
- Fully populated provider dashboard

## Deliberate exclusions

This phase does not fabricate or estimate leads, profile impressions, forecasts, scheduled dates, or client names. It contains no charts and does not mutate bookings. Booking changes remain excluded until the rules/schema differences around booking amounts are resolved. Profile editing points to support because there is no general provider edit route yet.

## Local verification

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Visit `http://localhost:5173/dashboard`. Test signed out, with a client account, and with provider accounts containing zero and multiple bookings.

## Next phase

Add a provider profile editor, calendar/detail booking views, and server-defined metrics. Add discovery analytics only after impression, profile-view, and conversion events are captured reliably and privacy rules are agreed.
