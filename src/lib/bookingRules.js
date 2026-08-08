export const REVIEW_DELAY_MS = 3 * 24 * 60 * 60 * 1000;
export const BOOKING_TRANSITIONS = Object.freeze({
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
});

export function canTransitionBooking(from, to) {
  return Boolean(BOOKING_TRANSITIONS[from]?.includes(to));
}

export function reviewUnlockTime(booking) {
  const scheduled = toMillis(booking?.scheduledAt);
  const confirmed = toMillis(booking?.confirmedAt);
  if (!scheduled || !confirmed || !["confirmed", "completed"].includes(booking?.status)) return null;
  return Math.max(scheduled, confirmed) + REVIEW_DELAY_MS;
}

export function isReviewEligible(booking, now = Date.now()) {
  const unlocksAt = reviewUnlockTime(booking);
  return Boolean(unlocksAt && now >= unlocksAt && !booking?.reviewSubmitted);
}

export function validateRatingReview(rating, text) {
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return "Choose a rating from 1 to 5 stars.";
  const cleaned = String(text || "").trim();
  if (cleaned.length < 10) return "Write at least 10 characters about your experience.";
  if (cleaned.length > 1000) return "Keep your review to 1,000 characters or fewer.";
  return "";
}

export function validateFacilityMedia(media) {
  const coverCount = media.filter((item) => item?.kind === "coverImage").length;
  const galleryCount = media.filter((item) => item?.kind === "galleryImage").length;
  if (coverCount !== 1) return "Facilities require exactly one cover image.";
  if (galleryCount > 8) return "Facilities may include up to eight gallery images.";
  if (media.some((item) => !["coverImage", "galleryImage"].includes(item?.kind))) return "Facility media must be a cover or gallery image.";
  return "";
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  const milliseconds = new Date(value).getTime();
  return Number.isNaN(milliseconds) ? 0 : milliseconds;
}
