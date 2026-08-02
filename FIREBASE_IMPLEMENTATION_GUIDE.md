# FitLink Kenya — Firebase Implementation Guide

Everything is pre-built. You only add credentials and run the executable files.

Contact on record: support@fitlink.co.ke · +254 717 506 729

---

## 1. What's in the repo

| File | Purpose |
|---|---|
| `src/lib/firebase.js` | Web SDK init for the React app (reads `.env`) |
| `.env.example` | Template for web credentials → copy to `.env` |
| `firestore.rules` | Security rules — **enforces the New Client lock** |
| `storage.rules` | Upload rules (own folder, 10 MB, images/PDF) |
| `firestore.indexes.json` | Composite indexes for provider/booking/commission queries |
| `firebase.json`, `.firebaserc` | Firebase CLI project config (hosting serves `dist/`) |
| `scripts/seed.js` | **Executable** — creates the whole DB with placeholders |
| `scripts/commissions.js` | **Executable** — commission engine + New Client lock demo |
| `scripts/syncSheets.js` | **Executable** — Firestore → Google Sheets (3 tabs) |
| `scripts/.env.example` | Template for service key path + Sheet ID |
| `scripts/serviceAccountKey.example.json` | Shape of the admin key you download |

## 2. One-time Firebase Console setup

1. Create a project at console.firebase.google.com.
2. **Authentication** → Sign-in method → enable *Email/Password* (add Google later if wanted).
3. **Firestore Database** → Create database → production mode → region `europe-west1` (closest to Kenya) or `us-central1`.
4. **Storage** → Get started.
5. **Project Settings → General → Your apps** → add a *Web app* → copy the config values.
6. **Project Settings → Service accounts** → *Generate new private key* → save the JSON.

## 3. Add credentials (the only manual step)

```bash
# Web app credentials
cp .env.example .env            # then paste the 6 VITE_FIREBASE_* values

# Admin credentials
#   put the downloaded key at scripts/serviceAccountKey.json
cp scripts/.env.example scripts/.env   # set SHEET_ID later (step 6)

# Point the CLI at your project
#   edit .firebaserc → replace YOUR_FIREBASE_PROJECT_ID
```

Secrets are already gitignored (`.env`, `scripts/.env`, `scripts/serviceAccountKey.json`).

## 4. Create the database (run the executables)

```bash
cd scripts
npm install
npm run seed              # creates users, providers, plans, bookings,
                          # referrals, commissions, blogPosts,
                          # successStories, settings — with placeholders
npm run demo-commission   # proves the New Client lock blocks duplicates
```

Seeded provider types: `trainer`, `gym`, `academy`, `wellness` — academies and
wellness centres use the **same plans and pricing as gyms** (`gym-starter`,
`gym-premium`), matching the Terms & Conditions.

## 5. Deploy the security rules

```bash
npm install -g firebase-tools     # once
firebase login
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### The New Client lock (how it's enforced)

* A referral document id is **`{clientId}_{providerId}`** in the `referrals`
  collection — one possible doc per client/provider pair, ever.
* `firestore.rules`: referrals can be **created once**, must have
  `locked: true`, can **never be updated**, and only an admin can delete.
* `scripts/commissions.js` writes the referral and its commission inside a
  **Firestore transaction** — if the referral already exists the transaction
  returns "already locked" and writes nothing, even under race conditions.
* Result: only the FIRST successful registration/booking triggers the 1–2%
  commission. Repeat bookings for the same pair can never be billed again.

### Commission lifecycle

`pending` → `invoiced` → `paid`. Use `markCommissionPaid(id, receipt)` from
`scripts/commissions.js` after M-Pesa settlement. Rates are clamped to the
1%–2% band from the Terms (default 1.5%, per-provider override allowed).

## 6. Link Google Sheets (commission tracking)

1. Create a blank Google Sheet; copy the long ID from its URL into `scripts/.env` → `SHEET_ID`.
2. Open `scripts/serviceAccountKey.json`, copy the `client_email` value, and
   **share the Sheet with that email as Editor**.
3. Run:

```bash
cd scripts
npm run sync-sheets
```

Three tabs are (re)written in full each run:
* **Providers** — every trainer/gym/academy/wellness centre with status & plan
* **Referrals** — every New Client lock with rate and commission amount
* **Commissions** — the full ledger + TOTAL and PENDING rows

Re-run after new bookings, or schedule it (cron / GitHub Action / Cloud
Scheduler → Cloud Function) for automatic syncs.

## 7. Wire the React app (when you're ready)

`src/lib/firebase.js` already exports `auth`, `db`, `storage`. Typical next steps:
* Signup/Login pages → `createUserWithEmailAndPassword` / `signInWithEmailAndPassword`, then create `users/{uid}`.
* Replace `src/data/*.js` mocks with Firestore queries (e.g. `query(collection(db, "providers"), where("type","==","trainer"), where("status","==","verified"))`).
* On a client's first paid registration/booking, call a backend endpoint or
  Cloud Function that runs the same transaction as `recordFirstBooking()` —
  never trust the client to write commissions (rules already block it).

## 8. Production checklist

- [ ] Rules + indexes deployed, tested in the Rules Playground
- [ ] Admin user created manually in `users` with `role: "admin"`
- [ ] M-Pesa Daraja backend wired (see `src/components/PaymentModal.jsx` notes)
- [ ] Sheets sync scheduled
- [ ] App Check enabled (reCAPTCHA v3) before public launch
- [ ] Budget alert set in Google Cloud billing




(// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYQ6NhcXI52nzLlyoYcrf61eE3kVGN1Wc",
  authDomain: "fitlink-7e078.firebaseapp.com",
  projectId: "fitlink-7e078",
  storageBucket: "fitlink-7e078.firebasestorage.app",
  messagingSenderId: "843726658374",
  appId: "1:843726658374:web:011e290d26a9a19855e347",
  measurementId: "G-69ED5NDJG2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);)
