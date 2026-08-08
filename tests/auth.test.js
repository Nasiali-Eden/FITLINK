import assert from "node:assert/strict";
import test from "node:test";
import { authErrorMessage, clientProfileDecision, postAuthRoute, safeReturnUrl } from "../src/lib/auth.js";

test("safe return URLs accept one leading slash and preserve booking routes", () => {
  assert.equal(safeReturnUrl("/trainer/abc?book=1", "/fallback"), "/trainer/abc?book=1");
  assert.equal(safeReturnUrl("/my-bookings", "/fallback"), "/my-bookings");
  for (const unsafe of ["//evil.example", "https://evil.example", "javascript:alert(1)", "/\\evil", "/%5Cevil", "/admin", "/definitely-not-a-route", "/trainer/abc?book=2", "/my-bookings?next=/admin", "my-bookings", ""]) {
    assert.equal(safeReturnUrl(unsafe, "/fallback"), "/fallback");
  }
});

test("auth errors distinguish credential, configuration, rate and service failures", () => {
  assert.match(authErrorMessage({ code: "auth/invalid-credential" }), /email or password/i);
  assert.match(authErrorMessage({ code: "auth/email-already-in-use" }), /already uses/i);
  assert.match(authErrorMessage({ code: "auth/weak-password" }), /stronger password/i);
  assert.match(authErrorMessage({ code: "auth/invalid-email" }), /valid email/i);
  assert.match(authErrorMessage({ code: "auth/operation-not-allowed" }), /unavailable/i);
  assert.match(authErrorMessage({ code: "auth/too-many-requests" }), /too many/i);
  assert.match(authErrorMessage({ code: "auth/network-request-failed" }), /connection/i);
  assert.match(authErrorMessage({ code: "firestore/permission-denied" }), /authenticated/i);
  assert.match(authErrorMessage({ code: "firestore/unavailable" }), /temporarily unavailable/i);
});

test("client profile repair never overwrites privileged roles", () => {
  assert.equal(clientProfileDecision(null), "create");
  assert.equal(clientProfileDecision({ role: "client" }), "keep");
  assert.equal(clientProfileDecision({ role: "provider" }), "preserve");
  assert.equal(clientProfileDecision({ role: "admin" }), "preserve");
});

test("post-auth routing retains provider and pending behaviour", () => {
  assert.equal(postAuthRoute({ role: "client" }, "/trainer/x?book=1"), "/trainer/x?book=1");
  assert.equal(postAuthRoute({ role: "provider", approved: false }), null);
  assert.equal(postAuthRoute({ role: "provider", approved: true, membershipEligible: false }), "/dashboard");
});
