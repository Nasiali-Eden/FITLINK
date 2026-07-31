/**
 * FitLink Kenya — Firestore DB seeder
 * Creates ALL collections with production-shaped placeholder data:
 *   users, providers (trainers/gyms/academies/wellness), bookings,
 *   referrals (New Client lock), commissions, plans, blogPosts,
 *   successStories, settings.
 *
 * Run:  cd scripts && npm install && npm run seed
 * Safe to re-run — uses fixed document ids (upserts).
 */
import { db, FieldValue, projectId } from "./_init.js";

const now = FieldValue.serverTimestamp();
const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=700&q=70`;

// ── users ───────────────────────────────────────────────────────────────────
const users = [
  { id: "admin-001",  role: "admin",    name: "FitLink Admin",   email: "dennismwanzia@gmail.com", phone: "+254717506729" },
  { id: "client-001", role: "client",   name: "Amara Johnson",   email: "amara@example.com",  phone: "+254700000001", gender: "F", location: "Nairobi" },
  { id: "client-002", role: "client",   name: "Kariuki Mwangi",  email: "kariuki@example.com", phone: "+254700000002", gender: "M", location: "Nairobi" },
  { id: "client-003", role: "client",   name: "Zainab Hassan",   email: "zainab@example.com", phone: "+254700000003", gender: "F", location: "Mombasa" },
  { id: "owner-t1",   role: "provider", name: "James Kipchoge",  email: "james@example.com",  phone: "+254700000010" },
  { id: "owner-t2",   role: "provider", name: "Sarah Mwangi",    email: "sarah@example.com",  phone: "+254700000011" },
  { id: "owner-g1",   role: "provider", name: "Elite Fitness Ltd", email: "elite@example.com", phone: "+254700000020" },
  { id: "owner-a1",   role: "provider", name: "Nairobi Sports Academy Ltd", email: "academy@example.com", phone: "+254700000030" },
  { id: "owner-w1",   role: "provider", name: "Serenity Wellness Ltd", email: "wellness@example.com", phone: "+254700000040" },
];

// ── providers: type = trainer | gym | academy | wellness ────────────────────
const providers = [
  { id: "trainer-001", type: "trainer", ownerUid: "owner-t1", name: "James Kipchoge",
    specialty: "Athletics & Running", category: "Athletics", location: "Nairobi",
    pricePerHour: 2500, rating: 4.9, reviewCount: 127, status: "verified",
    plan: "professional", photo: img("photo-1552674605-db6ffd4facb5"),
    bio: "Former national athlete coaching runners from beginners to podium finishers." },
  { id: "trainer-002", type: "trainer", ownerUid: "owner-t2", name: "Sarah Mwangi",
    specialty: "Yoga & Wellness", category: "Yoga", location: "Nairobi",
    pricePerHour: 1500, rating: 4.8, reviewCount: 89, status: "verified",
    plan: "starter", photo: img("photo-1544367567-0f2fcb009e0b"),
    bio: "Certified yoga instructor blending breathwork and mobility." },
  { id: "gym-001", type: "gym", ownerUid: "owner-g1", name: "Elite Fitness Nairobi",
    location: "Westlands, Nairobi", services: ["Gym", "Personal Training", "Classes"],
    membershipFrom: 3500, rating: 4.8, reviewCount: 234, status: "verified",
    plan: "gym-premium", photo: img("photo-1534438327276-14e5300c3a48") },
  { id: "academy-001", type: "academy", ownerUid: "owner-a1", name: "Nairobi Sports Academy",
    location: "Kasarani, Nairobi", services: ["Football Academy", "Athletics", "Swimming Squads"],
    registrationFrom: 8000, rating: 4.7, reviewCount: 64, status: "pending",
    plan: "gym-starter", photo: img("photo-1526232761682-d26e03ac148e"),
    note: "Academies use the same plans & pricing as gyms." },
  { id: "wellness-001", type: "wellness", ownerUid: "owner-w1", name: "Serenity Wellness Centre",
    location: "Kilimani, Nairobi", services: ["Physiotherapy", "Nutrition", "Massage Therapy"],
    registrationFrom: 4000, rating: 4.9, reviewCount: 41, status: "pending",
    plan: "gym-starter", photo: img("photo-1540497077202-7c8a3999166f"),
    note: "Wellness centres use the same plans & pricing as gyms." },
];

// ── plans (subscriptions; facilities = gyms + academies + wellness) ─────────
const plans = [
  { id: "starter",       audience: "trainer",  name: "Starter",      priceKes: 1500,  period: "month" },
  { id: "professional",  audience: "trainer",  name: "Professional", priceKes: 3000,  period: "month", popular: true },
  { id: "premium",       audience: "trainer",  name: "Premium",      priceKes: 5000,  period: "month" },
  { id: "gym-starter",   audience: "facility", name: "Starter",      priceKes: 5000,  period: "month",
    appliesTo: ["gym", "academy", "wellness"] },
  { id: "gym-premium",   audience: "facility", name: "Premium",      priceKes: 10000, period: "month", popular: true,
    appliesTo: ["gym", "academy", "wellness"] },
];

// ── bookings (one confirmed first-booking that generated a commission) ──────
const bookings = [
  { id: "booking-001", clientId: "client-001", providerId: "trainer-002",
    providerOwnerUid: "owner-t2", service: "Yoga — 1-on-1 session",
    amountKes: 1500, status: "completed", isFirstForPair: true },
  { id: "booking-002", clientId: "client-001", providerId: "trainer-002",
    providerOwnerUid: "owner-t2", service: "Yoga — 1-on-1 session",
    amountKes: 1500, status: "completed", isFirstForPair: false,
    note: "Repeat booking — NO commission (New Client lock already exists)." },
  { id: "booking-003", clientId: "client-002", providerId: "gym-001",
    providerOwnerUid: "owner-g1", service: "Monthly membership registration",
    amountKes: 3500, status: "confirmed", isFirstForPair: true },
];

// ── settings ─────────────────────────────────────────────────────────────────
const settings = [
  { id: "commission", minRate: 0.01, maxRate: 0.02, defaultRate: 0.015,
    model: "one-time-first-booking",
    description: "1–2% one-time commission on a client's FIRST successful registration/booking per provider. Enforced by the referrals New Client lock." },
  { id: "contact", email: "dennismwanzia@gmail.com", phone: "+254717506729", location: "Nairobi, Kenya" },
];

async function upsert(col, rows, extra = {}) {
  const batch = db.batch();
  for (const { id, ...data } of rows) {
    batch.set(db.collection(col).doc(id), { ...data, ...extra, updatedAt: now, createdAt: now }, { merge: true });
  }
  await batch.commit();
  console.log(`  ✓ ${col}: ${rows.length} docs`);
}

async function main() {
  console.log(`\nSeeding Firestore project: ${projectId}\n`);
  await upsert("users", users);
  await upsert("providers", providers);
  await upsert("plans", plans);
  await upsert("bookings", bookings);
  await upsert("settings", settings);

  // Blog + stories (same content as the website placeholders)
  await upsert("blogPosts", [
    { id: "post-001", category: "Fitness Tips", title: "5 Essential Tips for Starting Your Fitness Journey", author: "James Kipchoge", date: "2024-07-15", minutes: 5 },
    { id: "post-002", category: "Training", title: "How to Find the Right Personal Trainer for Your Goals", author: "Sarah Mwangi", date: "2024-07-12", minutes: 7 },
    { id: "post-003", category: "Nutrition", title: "Nutrition Basics: Fueling Your Body Right", author: "Grace Kiplagat", date: "2024-07-10", minutes: 6 },
  ]);
  await upsert("successStories", [
    { id: "story-001", name: "Amara Johnson", result: "Lost 25kg in 6 Months", trainer: "Sarah Mwangi", date: "2024-06" },
    { id: "story-002", name: "Kariuki Mwangi", result: "Improved Athletic Performance", trainer: "James Kipchoge", date: "2024-05" },
  ]);

  // Referrals + commissions via the New Client lock engine (guarantees no duplicates)
  const { recordFirstBooking } = await import("./commissions.js");
  await recordFirstBooking({ clientId: "client-001", providerId: "trainer-002", providerOwnerUid: "owner-t2", bookingId: "booking-001", amountKes: 1500, rate: 0.02 });
  await recordFirstBooking({ clientId: "client-001", providerId: "trainer-002", providerOwnerUid: "owner-t2", bookingId: "booking-002", amountKes: 1500, rate: 0.02 }); // → skipped, lock exists
  await recordFirstBooking({ clientId: "client-002", providerId: "gym-001", providerOwnerUid: "owner-g1", bookingId: "booking-003", amountKes: 3500, rate: 0.015 });

  console.log("\n✅ Seed complete. Open Firestore console to inspect the data.\n");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
