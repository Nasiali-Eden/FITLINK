/**
 * FitLink Kenya — Firestore → Google Sheets sync
 * Pushes Providers, Referrals (New Client locks) and the Commissions ledger
 * into three tabs of one spreadsheet, so commissions can be tracked in Sheets.
 *
 * One-time setup:
 *   1. Create a Google Sheet, copy its ID from the URL into scripts/.env (SHEET_ID).
 *   2. Share the sheet (Editor) with the service account email from
 *      serviceAccountKey.json (client_email).
 *
 * Run:  npm run sync-sheets      (re-run any time; tabs are rewritten in full)
 */
import "dotenv/config";
import { google } from "googleapis";
import { db, FieldValue } from "./_init.js";

const SHEET_ID = process.env.SHEET_ID;
if (!SHEET_ID || SHEET_ID === "your-google-sheet-id") {
  console.error("\n✗ Set SHEET_ID in scripts/.env (copy .env.example) and share the sheet with the service account email.\n");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const ts = (v) => (v && v.toDate ? v.toDate().toISOString().slice(0, 19).replace("T", " ") : "");

async function ensureTabs(titles) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = meta.data.sheets.map((s) => s.properties.title);
  const requests = titles.filter((t) => !existing.includes(t))
    .map((title) => ({ addSheet: { properties: { title } } }));
  if (requests.length) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } });
  }
}

async function writeTab(title, header, rows) {
  await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: `${title}!A:Z` });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${title}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [header, ...rows] },
  });
  console.log(`  ✓ ${title}: ${rows.length} rows`);
}

async function main() {
  console.log("\nSyncing Firestore → Google Sheets…\n");
  await ensureTabs(["Providers", "Referrals", "Commissions"]);

  // Providers
  const provSnap = await db.collection("providers").get();
  await writeTab("Providers",
    ["ID", "Type", "Name", "Location", "Status", "Plan", "Rating", "Reviews"],
    provSnap.docs.map((d) => { const p = d.data(); return [d.id, p.type, p.name, p.location || "", p.status, p.plan || "", p.rating || "", p.reviewCount || ""]; }));

  // Referrals — the New Client locks
  const refSnap = await db.collection("referrals").get();
  await writeTab("Referrals",
    ["Referral ID", "Client", "Provider", "First Booking", "First Amount (KSh)", "Rate", "Commission (KSh)", "Locked", "Created"],
    refSnap.docs.map((d) => { const r = d.data(); return [d.id, r.clientId, r.providerId, r.firstBookingId, r.firstBookingAmountKes, r.commissionRate, r.commissionKes, r.locked ? "YES" : "no", ts(r.createdAt)]; }));

  // Commissions ledger + totals row
  const comSnap = await db.collection("commissions").orderBy("createdAt", "desc").get();
  const comRows = comSnap.docs.map((d) => { const c = d.data(); return [d.id, c.providerId, c.clientId, c.bookingId, c.baseAmountKes, `${c.rate * 100}%`, c.amountKes, c.status, ts(c.createdAt), ts(c.paidAt)]; });
  const total = comSnap.docs.reduce((s, d) => s + d.data().amountKes, 0);
  const pending = comSnap.docs.filter((d) => d.data().status === "pending").reduce((s, d) => s + d.data().amountKes, 0);
  comRows.push([], ["TOTAL", "", "", "", "", "", total, `pending: ${pending}`]);
  await writeTab("Commissions",
    ["Commission ID", "Provider", "Client", "Booking", "Base (KSh)", "Rate", "Commission (KSh)", "Status", "Created", "Paid"],
    comRows);

  // Stamp sync time on commission docs
  const batch = db.batch();
  comSnap.docs.forEach((d) => batch.update(d.ref, { sheetSyncedAt: FieldValue.serverTimestamp() }));
  await batch.commit();

  console.log(`\n✅ Sheets sync complete → https://docs.google.com/spreadsheets/d/${SHEET_ID}\n`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
