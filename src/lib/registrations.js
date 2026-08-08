import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ref, uploadBytes } from "firebase/storage";
import { app, auth, storage } from "./firebase.js";
import { getPlan, sanitizePublicProviderDraft } from "./registrationConfig.js";

const functions = getFunctions(app, "europe-west1");
const cleanFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "-");

async function ensureSubmissionIdentity({ email, password, displayName, idempotencyKey }) {
  const sessionKey = `fitlink-application-${idempotencyKey}`;
  const isRetryIdentity = auth.currentUser && sessionStorage.getItem(sessionKey) === auth.currentUser.uid;
  const sameEmailAccount = auth.currentUser && !auth.currentUser.isAnonymous
    && auth.currentUser.email?.toLowerCase() === String(email || "").trim().toLowerCase();
  if (isRetryIdentity || sameEmailAccount) {
    sessionStorage.setItem(sessionKey, auth.currentUser.uid);
    return auth.currentUser;
  }
  if (auth.currentUser) await signOut(auth);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(credential.user, { displayName });
  sessionStorage.setItem(sessionKey, credential.user.uid);
  return credential.user;
}

async function uploadStagedFile(file, uid, idempotencyKey, category) {
  if (!file) return null;
  const objectRef = ref(storage, `stagedApplications/${uid}/${idempotencyKey}/${category}/${crypto.randomUUID()}-${cleanFileName(file.name)}`);
  const result = await uploadBytes(objectRef, file, { contentType: file.type, customMetadata: { originalName: file.name } });
  return { path: result.metadata.fullPath, name: file.name, contentType: file.type, size: file.size };
}

export async function createProviderApplication({ type, planId, details, account, paymentProof, publicFiles = [], privateFiles = {}, idempotencyKey }) {
  const plan = getPlan(planId, type);
  if (!plan) throw new Error("INVALID_APPLICATION");
  const user = await ensureSubmissionIdentity({ email: account?.email, password: account?.password, displayName: details.ownerName || details.name, idempotencyKey });
  let succeeded = false;
  try {
    const publicMedia = [];
    for (const entry of publicFiles.filter(Boolean)) {
      const file = entry.file || entry;
      const uploaded = await uploadStagedFile(file, user.uid, idempotencyKey, "public-media");
      publicMedia.push({ ...uploaded, kind: entry.kind || (type === "trainer" ? "profilePhoto" : "galleryImage") });
    }
    const privateDocuments = [];
    for (const [kind, file] of Object.entries(privateFiles)) {
      if (file) privateDocuments.push({ kind, ...(await uploadStagedFile(file, user.uid, idempotencyKey, "private-documents")) });
    }
    const submit = httpsCallable(functions, "submitProviderApplication");
    const response = await submit({
      idempotencyKey,
      type,
      planId,
      details,
      publicProfile: sanitizePublicProviderDraft({ ...details, type }),
      publicMedia,
      privateDocuments,
      paymentProof: plan.membershipEligible ? paymentProof : null,
    });
    succeeded = true;
    return response.data;
  } finally {
    if (succeeded) {
      sessionStorage.removeItem(`fitlink-application-${idempotencyKey}`);
      await signOut(auth);
    }
  }
}

export function friendlyRegistrationError(error) {
  console.error("Provider application failed", error);
  if (error?.code === "auth/weak-password") return "Use a password with at least 8 characters.";
  if (error?.code === "auth/invalid-email") return "Enter a valid email address.";
  if (error?.code === "auth/email-already-in-use") return "An account already uses this email. Sign in or use a different email address.";
  if (error?.code === "auth/operation-not-allowed") return "Email/password registration is not enabled. Please contact FitLink support.";
  if (error?.code === "functions/already-exists") return "We already received this application. Please wait for our confirmation email.";
  if (error?.code === "storage/unauthorized") return "One or more files could not be uploaded. Check the file type and size, then try again.";
  return "We could not submit your application. Check your connection and details, then try again. If this continues, contact FitLink support.";
}

// Kept as a compatibility export for older imports; new registration pages use createProviderApplication.
export const createProviderRegistration = createProviderApplication;
