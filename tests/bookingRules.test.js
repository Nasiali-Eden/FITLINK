import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { canTransitionBooking, isReviewEligible, reviewUnlockTime, validateFacilityMedia, validateRatingReview } from "../src/lib/bookingRules.js";

test("booking lifecycle permits safe forward-only transitions", () => {
  assert.equal(canTransitionBooking("pending", "confirmed"), true);
  assert.equal(canTransitionBooking("pending", "cancelled"), true);
  assert.equal(canTransitionBooking("confirmed", "completed"), true);
  assert.equal(canTransitionBooking("completed", "confirmed"), false);
  assert.equal(canTransitionBooking("cancelled", "pending"), false);
});

test("reviews unlock three days after the later scheduled or confirmation time", () => {
  const booking = { status: "confirmed", scheduledAt: "2026-08-10T10:00:00Z", confirmedAt: "2026-08-09T10:00:00Z", reviewSubmitted: false };
  assert.equal(reviewUnlockTime(booking), Date.parse("2026-08-13T10:00:00Z"));
  assert.equal(isReviewEligible(booking, Date.parse("2026-08-13T09:59:59Z")), false);
  assert.equal(isReviewEligible(booking, Date.parse("2026-08-13T10:00:00Z")), true);
  assert.equal(isReviewEligible({ ...booking, reviewSubmitted: true }, Date.parse("2026-08-14T10:00:00Z")), false);
});

test("rating and review validation is bounded", () => {
  assert.match(validateRatingReview(0, "A useful review"), /rating/i);
  assert.match(validateRatingReview(5, "short"), /10 characters/i);
  assert.equal(validateRatingReview(5, "A genuinely useful review."), "");
});

test("facility media requires one cover and no more than eight gallery images", () => {
  assert.match(validateFacilityMedia([]), /exactly one cover/i);
  assert.equal(validateFacilityMedia([{ kind: "coverImage" }, ...Array.from({ length: 8 }, () => ({ kind: "galleryImage" }))]), "");
  assert.match(validateFacilityMedia([{ kind: "coverImage" }, ...Array.from({ length: 9 }, () => ({ kind: "galleryImage" }))]), /up to eight/i);
});

test("booking and review writes are callable-only and client route is exposed", async () => {
  const [rules, functions, app] = await Promise.all([
    readFile(new URL("../firestore.rules", import.meta.url), "utf8"),
    readFile(new URL("../functions/index.js", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(rules, /match \/bookings\/\{bookingId\}[\s\S]*allow create, update: if false/);
  assert.match(rules, /match \/reviews\/\{reviewId\}[\s\S]*allow write: if false/);
  assert.match(functions, /export const createBooking = onCall/);
  assert.match(functions, /export const submitVerifiedReview = onCall/);
  assert.match(app, /my-bookings/);
});
