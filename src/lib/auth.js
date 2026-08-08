import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { dashboardAccess } from "./registrationConfig.js";

const CLIENT_FIELDS = ["name", "email", "phone"];
const RETURN_ROUTES = new Set(["/", "/my-bookings", "/dashboard"]);

export function safeReturnUrl(value, fallback = "") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || /^[a-z][a-z\d+.-]*:/i.test(value)) return fallback;
  try {
    const parsed = new URL(value, "https://fitlink.local");
    if (parsed.origin !== "https://fitlink.local" || !parsed.pathname.startsWith("/")) return fallback;
    let decodedPath;
    try { decodedPath = decodeURIComponent(parsed.pathname); } catch { return fallback; }
    if (decodedPath.includes("\\") || decodedPath.startsWith("//") || parsed.hash) return fallback;
    const providerPath = /^\/(trainer|gym|academy|wellness)\/[^/?#]+$/.test(decodedPath);
    if (providerPath) {
      const keys = [...parsed.searchParams.keys()];
      if (keys.length > 1 || (keys.length === 1 && (keys[0] !== "book" || parsed.searchParams.get("book") !== "1"))) return fallback;
    } else if (!RETURN_ROUTES.has(decodedPath) || parsed.search) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function authErrorMessage(error, action = "sign in") {
  const code = String(error?.code || "");
  const messages = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/email-already-in-use": "An account already uses this email. Log in instead.",
    "auth/weak-password": "Choose a stronger password with at least 8 characters.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/operation-not-allowed": "Email account access is currently unavailable. Contact FitLink support.",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes, then try again.",
    "auth/network-request-failed": "We could not reach the service. Check your connection and try again.",
    "permission-denied": "Your account was authenticated, but its profile could not be accessed.",
    "firestore/permission-denied": "Your account was authenticated, but its profile could not be accessed.",
    "unavailable": "The service is temporarily unavailable. Please try again shortly.",
    "firestore/unavailable": "The service is temporarily unavailable. Please try again shortly.",
  };
  return messages[code] || `We could not ${action}. Please try again.`;
}

export function clientProfileDecision(existing) {
  if (!existing) return "create";
  if (["provider", "admin"].includes(existing.role)) return "preserve";
  return "keep";
}

export async function ensureClientProfile(db, user, details = {}) {
  const reference = doc(db, "users", user.uid);
  const snapshot = await getDoc(reference);
  const existing = snapshot.exists() ? snapshot.data() : null;
  const decision = clientProfileDecision(existing);
  if (decision !== "create") return { profile: existing, decision };

  const cleaned = Object.fromEntries(CLIENT_FIELDS.map((key) => [key, String(details[key] || "").trim()]).filter(([, value]) => value));
  const profile = {
    ...cleaned,
    name: cleaned.name || user.displayName || "FitLink client",
    email: (cleaned.email || user.email || "").toLowerCase(),
    phone: cleaned.phone || "",
    role: "client",
    registrationType: null,
    approved: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(reference, profile);
  return { profile, decision };
}

export function postAuthRoute(account, requestedReturnTo = "") {
  const access = dashboardAccess(account);
  if (["limited", "allowed", "expired"].includes(access)) return "/dashboard";
  if (access === "pending") return null;
  return safeReturnUrl(requestedReturnTo, "/my-bookings");
}
