import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dashboardAccess, getPlan, normalizeKenyanPhone, normalizeMpesaCode, sanitizePublicProviderDraft } from "../src/lib/registrationConfig.js";

test("canonical plans own price and membership eligibility", () => {
  assert.deepEqual([getPlan("starter", "trainer").price, getPlan("starter", "trainer").membershipEligible], [1500, false]);
  assert.deepEqual([getPlan("professional", "trainer").price, getPlan("professional", "trainer").membershipEligible], [3000, true]);
  assert.deepEqual([getPlan("premium", "trainer").price, getPlan("premium", "trainer").membershipEligible], [5000, true]);
  assert.deepEqual([getPlan("gym-starter", "academy").price, getPlan("gym-starter", "academy").membershipEligible], [5000, false]);
  assert.deepEqual([getPlan("gym-premium", "wellness").price, getPlan("gym-premium", "wellness").membershipEligible], [10000, true]);
  assert.equal(getPlan("professional", "gym"), null);
});

test("Kenyan phone and M-Pesa proof normalization is strict", () => {
  assert.equal(normalizeKenyanPhone("0712 345 678"), "+254712345678");
  assert.equal(normalizeKenyanPhone("+254 712 345 678"), "+254712345678");
  assert.equal(normalizeKenyanPhone("123"), null);
  assert.equal(normalizeMpesaCode("tgh4ab12cd"), "TGH4AB12CD");
  assert.equal(normalizeMpesaCode("bad"), null);
});

test("public provider sanitizer excludes sensitive application data", () => {
  const publicDraft = sanitizePublicProviderDraft({ name: "A", phone: "+254700000000", email: "private@example.com", privateIdentifier: "123", payment: { transactionCode: "SECRET" }, documents: ["private"], payerPhone: "+254711111111", bio: "Public" });
  assert.deepEqual(publicDraft, { name: "A", bio: "Public" });
});

test("dashboard access supports limited, full, and expired provider accounts", () => {
  const now = Date.parse("2026-08-06T00:00:00Z");
  assert.equal(dashboardAccess({ role: "provider", membershipEligible: false, approved: true }, now), "limited");
  assert.equal(dashboardAccess({ role: "provider", membershipEligible: true, approved: false, membershipStatus: "pending_payment_confirmation" }), "pending");
  assert.equal(dashboardAccess({ role: "provider", membershipEligible: true, approved: true, membershipStatus: "active", membershipExpiresAt: "2026-09-05T00:00:00Z" }, now), "allowed");
  assert.equal(dashboardAccess({ role: "provider", membershipEligible: true, approved: true, membershipStatus: "active", membershipExpiresAt: "2026-08-05T23:59:59Z" }, now), "expired");
});

test("registration copy and canonical routes describe the manual flow", async () => {
  const [form, app, payment, pricing, dashboard, footer] = await Promise.all([
    readFile(new URL("../src/components/ProviderApplicationForm.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/PaymentModal.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/Pricing.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/ProviderDashboard.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Footer.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(form, /Submit M-Pesa confirmation/);
  assert.match(form, /Please wait for that confirmation email before logging in/);
  assert.match(form, /limited dashboard/i);
  assert.match(app, /facility-registration/);
  assert.match(app, /register-facility/);
  assert.match(pricing, /registrationPath.*plan=/);
  assert.match(form, /aria-pressed/);
  assert.match(form, /focus-within:ring-2/);
  assert.match(form, /aria-live="polite"/);
  assert.match(form, /Add more profile details/);
  assert.match(dashboard, /membershipExpiresAt/);
  assert.match(footer, /md:grid-cols-2 lg:grid-cols-4/);
  assert.doesNotMatch(`${form}\n${payment}`, /Pochi|demo payment/i);
});
