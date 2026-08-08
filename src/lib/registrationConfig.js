import { gymPlans, trainerPlans } from "../data/pricing.js";

export const MPESA_NUMBER_DISPLAY = import.meta.env?.VITE_FITLINK_MPESA_NUMBER || "0717 506 729";
export const MPESA_NUMBER_E164 = import.meta.env?.VITE_FITLINK_MPESA_NUMBER_E164 || "+254717506729";
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const plansById = Object.fromEntries([...trainerPlans, ...gymPlans].map((plan) => [plan.id, plan]));
const allowedPlans = {
  trainer: new Set(trainerPlans.map(({ id }) => id)),
  gym: new Set(gymPlans.map(({ id }) => id)),
  academy: new Set(gymPlans.map(({ id }) => id)),
  wellness: new Set(gymPlans.map(({ id }) => id)),
};

export function getPlan(planId, type) {
  const plan = plansById[planId];
  return plan && allowedPlans[type]?.has(planId) ? plan : null;
}

export function normalizeKenyanPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return `+254${digits.slice(1)}`;
  if (/^254[17]\d{8}$/.test(digits)) return `+${digits}`;
  if (/^[17]\d{8}$/.test(digits)) return `+254${digits}`;
  return null;
}

export function normalizeMpesaCode(value) {
  const code = String(value || "").trim().toUpperCase().replace(/\s/g, "");
  return /^[A-Z0-9]{10,12}$/.test(code) ? code : null;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim().toLowerCase());
}

export function validateFile(file, { image = false } = {}) {
  if (!file) return "Please choose a file.";
  const allowed = image ? /^image\/(jpeg|png|webp)$/ : /^(image\/(jpeg|png|webp)|application\/pdf)$/;
  if (!allowed.test(file.type)) return image ? "Use a JPG, PNG, or WebP image." : "Use a JPG, PNG, WebP, or PDF file.";
  if (file.size > (image ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES)) return `File must be ${image ? "8" : "10"} MB or smaller.`;
  return "";
}

export function sanitizePublicProviderDraft(details) {
  const allowed = ["name", "type", "county", "town", "location", "specialty", "category", "yearsExperience", "certifications", "pricePerHour", "languages", "availability", "bio", "mapUrl", "openingHours", "services", "membershipFrom", "registrationFrom", "sessionFrom"];
  return Object.fromEntries(allowed.filter((key) => details[key] !== undefined).map((key) => [key, details[key]]));
}

function timestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function dashboardAccess(account, now = Date.now()) {
  if (!account || account.role !== "provider") return "not-provider";
  if (!account.approved) return "pending";
  const expiresAt = timestampMillis(account.membershipExpiresAt);
  if (expiresAt && expiresAt <= now) return "expired";
  if (!account.membershipEligible) return "limited";
  if (account.membershipStatus !== "active") return "pending";
  return "allowed";
}
