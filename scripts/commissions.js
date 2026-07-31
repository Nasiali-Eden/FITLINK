/**
 * FitLink Kenya — Commission engine with the NEW CLIENT LOCK.
 *
 * Business rule:
 *   • The first successful registration/booking of a client with a provider
 *     creates a referral tag (doc id `${clientId}_${providerId}`) and ONE
 *     commission entry of 1–2% of that first fee.
 *   • The referral tag is permanent. Any later booking for the same pair is
 *     detected inside a Firestore TRANSACTION and NO second commission is
 *     ever written — even if two requests race each other.
 *
 * Run a demo (after seeding):  npm run demo-commission
 */
import { db, FieldValue } from "./_init.js";

const RATE_MIN = 0.01, RATE_MAX = 0.02;

/**
 * Record a client's first booking with a provider.
 * Returns { created: boolean, referralId, commission? }.
 */
export async function recordFirstBooking({ clientId, providerId, providerOwnerUid, bookingId, amountKes, rate = 0.015 }) {
  if (rate < RATE_MIN || rate > RATE_MAX) {
    throw new Error(`Commission rate ${rate} outside allowed band ${RATE_MIN}–${RATE_MAX}`);
  }
  const referralId = `${clientId}_${providerId}`;
  const referralRef = db.collection("referrals").doc(referralId);
  const commissionRef = db.collection("commissions").doc(`comm-${referralId}`);

  const result = await db.runTransaction(async (tx) => {
    const existing = await tx.get(referralRef);
    if (existing.exists) {
      // NEW CLIENT LOCK: this client is already a FitLink referral for this
      // provider → repeat booking, no commission.
      return { created: false, referralId };
    }
    const commissionKes = Math.round(amountKes * rate);
    tx.set(referralRef, {
      clientId, providerId, providerOwnerUid,
      firstBookingId: bookingId,
      firstBookingAmountKes: amountKes,
      commissionRate: rate,
      commissionKes,
      locked: true,                       // permanent tag — rules forbid updates
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.set(commissionRef, {
      referralId, clientId, providerId, providerOwnerUid,
      bookingId, baseAmountKes: amountKes, rate, amountKes: commissionKes,
      status: "pending",                  // pending → invoiced → paid
      sheetSyncedAt: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { created: true, referralId, commission: commissionKes };
  });

  console.log(result.created
    ? `  ✓ NEW referral ${referralId} — commission KSh ${result.commission} recorded`
    : `  ↺ referral ${referralId} already locked — repeat booking, no commission`);
  return result;
}

/** Mark a commission as paid (e.g. after M-Pesa settlement). */
export async function markCommissionPaid(commissionId, receipt) {
  await db.collection("commissions").doc(commissionId).update({
    status: "paid", receipt: receipt || null, paidAt: FieldValue.serverTimestamp(),
  });
  console.log(`  ✓ commission ${commissionId} marked paid`);
}

/** List commissions with totals — the tracking view. */
export async function listCommissions() {
  const snap = await db.collection("commissions").orderBy("createdAt", "desc").get();
  let total = 0, pending = 0;
  console.log("\n Commissions ledger");
  console.log(" ─────────────────────────────────────────────────────────────");
  snap.forEach((d) => {
    const c = d.data();
    total += c.amountKes;
    if (c.status === "pending") pending += c.amountKes;
    console.log(` ${d.id}  ${c.providerId}  ←  ${c.clientId}   KSh ${c.amountKes} (${c.rate * 100}%)  [${c.status}]`);
  });
  console.log(" ─────────────────────────────────────────────────────────────");
  console.log(` TOTAL: KSh ${total}   ·   PENDING: KSh ${pending}\n`);
}

// CLI: `node commissions.js demo` — proves the lock blocks duplicates.
if (process.argv[2] === "demo") {
  console.log("\nDemo: attempting a duplicate first-booking for client-001 × trainer-002 …");
  await recordFirstBooking({ clientId: "client-001", providerId: "trainer-002", providerOwnerUid: "owner-t2", bookingId: "booking-dup", amountKes: 9999, rate: 0.02 });
  await listCommissions();
  process.exit(0);
}
