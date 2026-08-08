# FitLink Kenya — Firebase implementation guide

Firebase project: `fitlink-7e078`
Support: `support@fitlink.co.ke` · `+254 717 506 729`

## Implemented architecture

- Firebase Authentication handles email/password signup, login, and password reset.
- `users/{uid}` stores every client or provider account.
- `providerApplications/{applicationId}` privately stores trainer and facility applications awaiting manual review.
- The callable `submitProviderApplication` validates each application; browsers cannot write applications or public providers directly.
- Listing-only applicants use a temporary anonymous Firebase identity. Professional/Premium applicants use an email/password identity so approved membership can later be accessed by login.
- Only the admin-only `reviewProviderApplication` callable creates an approved public `providers/{providerId}` record.
- Public home, directory, and profile screens query only providers where `approved == true`.
- Admins review applications through the admin-only `reviewProviderApplication` callable; application status and entitlement fields must not be edited directly.
- All applicant files first upload to owner-only `stagedApplications/{uid}/{idempotencyKey}` paths. Approval copies only approved public media into public Storage; identity documents remain private.
- Professional/Premium payment proof is recorded as a manual M-Pesa payment awaiting confirmation. No STK Push or automatic payment verification is claimed.
- A Firestore-triggered Firebase Function prepares automated registration emails to both `support@fitlink.co.ke` and `fitlinkkenya@gmail.com` through Resend.
- Google Sheets integration is intentionally deferred in `TODO.md`.

## Files

| File | Purpose |
|---|---|
| `.env` | Local Firebase web configuration; ignored by Git |
| `.firebaserc` | Default Firebase project |
| `src/lib/firebase.js` | Firebase web SDK initialization |
| `src/lib/registrations.js` | Staged uploads and callable application submission |
| `src/hooks/useProviders.js` | Live approved-provider queries |
| `firestore.rules` | Approval and ownership enforcement |
| `storage.rules` | Public photo/private document separation |
| `firestore.indexes.json` | Provider and ledger indexes |
| `functions/index.js` | Application submission/review callables and notification email triggers |
| `scripts/syncSheets.js` | Deferred Firestore-to-Sheets sync |

## Firebase Console prerequisites

1. Authentication → Sign-in method → enable Email/Password and Anonymous. Anonymous auth is used only as a temporary secure upload/submission identity for listing-only applications; it does not grant a dashboard membership.
2. Firestore Database → create a production database.
3. Storage → initialize the default bucket.
4. Create a user manually for administration, then set `users/{uid}.role` to `admin`.
5. Enable billing before deploying Cloud Functions.
6. Configure the production M-Pesa number in Hosting build variables using `VITE_FITLINK_MPESA_NUMBER` and `VITE_FITLINK_MPESA_NUMBER_E164`.
7. Register the web app with Firebase App Check and change the callable configuration from `enforceAppCheck: false` to `true` after verifying production tokens.

## Email notification setup

The email key must stay in Firebase Secret Manager and must never appear in React code, documentation, `.env`, or Git.

1. Create a Resend account and verify the `fitlink.co.ke` domain.
2. Create a Resend API key.
3. Store it interactively:

```powershell
npm.cmd exec firebase -- functions:secrets:set RESEND_API_KEY --project fitlink-7e078
```

4. Before deployment, create `functions/.env.fitlink-7e078` (it is Git-ignored) and configure the backend-authoritative M-Pesa recipient in E.164 format. The value must match the frontend `VITE_FITLINK_MPESA_NUMBER_E164` value:

```dotenv
FITLINK_MPESA_NUMBER=+2547XXXXXXXX
```

Do not accept or persist an M-Pesa recipient supplied by the browser. `submitProviderApplication` always writes the configured backend value to the payment proof.

5. Deploy the notification functions:

```powershell
npm.cmd exec firebase -- deploy --only functions --project fitlink-7e078
```

Each new provider email includes the application ID, provider type, contact details, plan, amount, M-Pesa transaction code, and review state. The applicant receives a submission acknowledgement and a later approval/rejection email; delivery state is recorded privately on the application. Client signups send a smaller account notification. Sensitive uploaded documents are not attached or exposed by email.

## Deploy

```powershell
npm.cmd run build
npm.cmd exec firebase -- deploy --only firestore:rules,firestore:indexes,storage,hosting --project fitlink-7e078
```

This repository does not claim the redesigned registration functions or rules are deployed. Deploy only after testing in the target Firebase project and receiving production approval.

## Manual approval workflow

1. Open Firestore and review the private `providerApplications` record, staged documents, selected plan, and `payment.transactionCode`.
2. For Professional/Premium, verify the payment separately in M-Pesa.
3. From a trusted admin session, call `reviewProviderApplication` with the application ID and an `approved` or `rejected` decision.
4. Approval copies public media, creates the public provider record, activates eligible membership, and queues the applicant confirmation email.

Do not manually copy a pending application into `providers`: the review callable performs the state changes together and records the reviewing administrator.

## Deferred and production-hardening tasks

- Google Sheets: follow `TODO.md`; never ship service-account credentials to the browser.
- Optionally replace manual M-Pesa confirmation with Safaricom Daraja verification.
- Enable Firebase App Check before public launch.
- Confirm Anonymous and Email/Password Auth providers are enabled before accepting applications.
- Configure a Firebase password policy of at least 8 characters to match the registration form.
- Deploy `submitProviderApplication`, `reviewProviderApplication`, and notification functions before deploying the new registration UI.
- Add Cloud Billing budget alerts and monitoring.
- Test rules with Firebase Emulator Suite or the Rules Playground.
- Review dependency advisories before each release.
