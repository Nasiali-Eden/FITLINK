import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret, defineString } from "firebase-functions/params";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

initializeApp();

const db = getFirestore();

const resendApiKey = defineSecret("RESEND_API_KEY");
const fitlinkMpesaNumber = defineString("FITLINK_MPESA_NUMBER", {
  description: "FitLink M-Pesa recipient number in Kenyan E.164 format, for example +2547XXXXXXXX",
});
const recipients = ["support@fitlink.co.ke", "fitlinkkenya@gmail.com"];
const planCatalog = Object.freeze({
  starter: { name: "Starter", priceKes: 1500, providerTypes: ["trainer"], membershipEligible: false },
  professional: { name: "Professional", priceKes: 3000, providerTypes: ["trainer"], membershipEligible: true },
  premium: { name: "Premium", priceKes: 5000, providerTypes: ["trainer"], membershipEligible: true },
  "gym-starter": { name: "Starter", priceKes: 5000, providerTypes: ["gym", "academy", "wellness"], membershipEligible: false },
  "gym-premium": { name: "Premium", priceKes: 10000, providerTypes: ["gym", "academy", "wellness"], membershipEligible: true },
});
const providerTypes = new Set(["trainer", "gym", "academy", "wellness"]);
const membershipDurationMs = 30 * 24 * 60 * 60 * 1000;
const reviewDelayMs = 3 * 24 * 60 * 60 * 1000;
const bookingTransitions = Object.freeze({ pending: ["confirmed", "cancelled"], confirmed: ["completed", "cancelled"] });

function newMembershipWindow() {
  const activatedAt = Timestamp.now();
  return {
    membershipActivatedAt: activatedAt,
    membershipExpiresAt: Timestamp.fromMillis(activatedAt.toMillis() + membershipDurationMs),
  };
}

const plain = (value) => {
  if (value === undefined || value === null || value === "") return "Not provided";
  if (Array.isArray(value)) return value.join(", ");
  return String(value).replace(/[\r\n]+/g, " ").slice(0, 500);
};

const safe = (value) => plain(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;",
}[character]));

async function sendRegistrationEmail(subject, fields) {
  const rows = Object.entries(fields)
    .map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">${label}</td><td style="padding:6px 0">${safe(value)}</td></tr>`)
    .join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "FitLink Kenya <notifications@fitlink.co.ke>",
      to: recipients,
      subject,
      html: `<h2>${subject}</h2><table>${rows}</table><p>Review and approve this registration in Firebase before it becomes public.</p>`,
    }),
  });

  if (!response.ok) throw new Error(`Resend returned ${response.status}: ${await response.text()}`);
}

async function sendApplicantEmail(to, subject, html) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "FitLink Kenya <notifications@fitlink.co.ke>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!response.ok) throw new Error(`Resend returned ${response.status}: ${await response.text()}`);
}

const requiredString = (value, field, max = 200) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }
  return value.trim().slice(0, max);
};

const optionalString = (value, max = 1000) => typeof value === "string" ? value.trim().slice(0, max) : "";

function normalizedEmail(value, field = "email") {
  const email = requiredString(value, field, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", `Enter a valid ${field}.`);
  }
  return email;
}

function normalizedKenyanPhone(value, field, mobileOnly = false) {
  let phone = requiredString(value, field, 30).replace(/[\s().-]/g, "");
  if (/^0\d{9}$/.test(phone)) phone = `+254${phone.slice(1)}`;
  else if (/^254\d{9}$/.test(phone)) phone = `+${phone}`;
  const pattern = mobileOnly ? /^\+254[17]\d{8}$/ : /^\+254[1-9]\d{8}$/;
  if (!pattern.test(phone)) {
    throw new HttpsError("invalid-argument", `Enter a valid Kenyan ${field}.`);
  }
  return phone;
}

function cleanRecord(value, depth = 0) {
  if (!value || typeof value !== "object" || Array.isArray(value) || depth > 2) return {};
  return Object.fromEntries(Object.entries(value).slice(0, 60).flatMap(([key, item]) => {
    if (!/^[a-zA-Z][a-zA-Z0-9]{0,49}$/.test(key)) return [];
    if (typeof item === "string") return [[key, item.trim().slice(0, 2000)]];
    if (typeof item === "number" && Number.isFinite(item)) return [[key, item]];
    if (typeof item === "boolean") return [[key, item]];
    if (Array.isArray(item)) return [[key, item.slice(0, 30).map((entry) => optionalString(entry, 200)).filter(Boolean)]];
    if (item && typeof item === "object") return [[key, cleanRecord(item, depth + 1)]];
    return [];
  }));
}

function cleanFileReferences(value, prefix, label, allowedKinds = []) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 20) {
    throw new HttpsError("invalid-argument", `${label} must be an array of at most 20 files.`);
  }
  return value.map((item) => {
    const path = typeof item === "string" ? item : item?.path;
    if (typeof path !== "string" || !path.startsWith(prefix) || path.includes("..")) {
      throw new HttpsError("invalid-argument", `Invalid ${label} file path.`);
    }
    const kind = optionalString(typeof item === "object" ? item.kind : "", 40);
    if (kind && !allowedKinds.includes(kind)) {
      throw new HttpsError("invalid-argument", `Invalid ${label} kind.`);
    }
    return {
      path,
      name: optionalString(typeof item === "object" ? item.name : path.split("/").pop(), 200),
      contentType: optionalString(typeof item === "object" ? item.contentType : "", 100),
      ...(kind ? { kind } : {}),
    };
  });
}

function cleanPaymentProof(value, plan) {
  if (!plan.membershipEligible) return null;
  if (!value || typeof value !== "object") {
    throw new HttpsError("invalid-argument", "M-Pesa payment confirmation is required for this plan.");
  }
  const transactionCode = requiredString(value.transactionCode, "M-Pesa transaction code", 12).toUpperCase();
  if (!/^[A-Z0-9]{10,12}$/.test(transactionCode)) {
    throw new HttpsError("invalid-argument", "Enter a valid M-Pesa transaction code.");
  }
  return {
    method: "mpesa_manual",
    transactionCode,
    payerPhone: normalizedKenyanPhone(value.payerPhone, "payment phone", true),
    recipientPhone: normalizedKenyanPhone(fitlinkMpesaNumber.value(), "configured M-Pesa recipient number", true),
    amountKes: plan.priceKes,
    status: "pending_confirmation",
    submittedAt: FieldValue.serverTimestamp(),
  };
}

function providerMediaData(application, urls) {
  if (application.type === "trainer") {
    const profile = urls[(application.publicMedia || []).findIndex((item) => item.kind === "profilePhoto")] || urls[0] || "";
    return { profilePhotoUrl: profile, photo: profile, photos: profile ? [profile] : [] };
  }
  const files = application.publicMedia || [];
  const coverIndex = files.findIndex((item) => item.kind === "coverImage");
  const coverImageUrl = urls[coverIndex] || "";
  const galleryImageUrls = files.flatMap((item, index) => item.kind === "galleryImage" && urls[index] ? [urls[index]] : []);
  return { coverImageUrl, galleryImageUrls, photo: coverImageUrl, photos: [coverImageUrl, ...galleryImageUrls].filter(Boolean) };
}

const publicProviderFields = Object.freeze([
  "name", "county", "town", "location", "specialty", "category",
  "yearsExperience", "certifications", "pricePerHour", "languages",
  "availability", "bio", "mapUrl", "openingHours", "services",
  "membershipFrom", "registrationFrom", "sessionFrom",
]);

function publicProviderData(application) {
  const submitted = { ...application.details, ...application.publicProfile };
  return Object.fromEntries(publicProviderFields.flatMap((field) =>
    submitted[field] === undefined ? [] : [[field, submitted[field]]]
  ));
}

async function isAdmin(uid, token) {
  if (token?.admin === true) return true;
  const snapshot = await db.doc(`users/${uid}`).get();
  return snapshot.exists && snapshot.data()?.role === "admin";
}

export const submitProviderApplication = onCall(
  { region: "europe-west1", enforceAppCheck: false, invoker: "public" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "A secure registration session is required.");
    const input = request.data || {};
    const uid = request.auth.uid;
    const idempotencyKey = requiredString(input.idempotencyKey, "idempotency key", 80);
    if (!/^[a-zA-Z0-9_-]{10,80}$/.test(idempotencyKey)) {
      throw new HttpsError("invalid-argument", "Invalid registration key.");
    }
    const type = requiredString(input.type, "provider type", 20).toLowerCase();
    const planId = requiredString(input.planId, "plan", 30).toLowerCase();
    const plan = planCatalog[planId];
    if (!providerTypes.has(type) || !plan || !plan.providerTypes.includes(type)) {
      throw new HttpsError("invalid-argument", "The selected provider type and plan do not match.");
    }

    const signInProvider = request.auth.token?.firebase?.sign_in_provider || "unknown";
    if (signInProvider === "anonymous") {
      throw new HttpsError("failed-precondition", "Provider applications require an email account.");
    }

    const details = cleanRecord(input.details);
    details.name = requiredString(details.name, "name", 160);
    details.ownerName = requiredString(details.ownerName, "contact name", 160);
    details.email = normalizedEmail(details.email || request.auth.token?.email);
    details.phone = normalizedKenyanPhone(details.phone, "phone number");
    details.location = requiredString(details.location, "location", 240);
    if (details.email !== String(request.auth.token?.email || "").trim().toLowerCase()) {
      throw new HttpsError("invalid-argument", "Registration email must match the email used to create this account.");
    }
    details.county = requiredString(details.county, "county", 100);
    details.town = requiredString(details.town, "town", 120);
    details.bio = requiredString(details.bio, "profile description", 2000);
    if (details.bio.length < 30) {
      throw new HttpsError("invalid-argument", "Profile description must be at least 30 characters.");
    }
    if (type === "trainer") {
      details.specialty = requiredString(details.specialty, "trainer specialty", 160);
      details.category = optionalString(details.category || details.specialty, 160);
      if (!Number.isFinite(details.pricePerHour) || details.pricePerHour <= 0 || details.pricePerHour > 1000000) {
        throw new HttpsError("invalid-argument", "Enter a valid trainer hourly rate.");
      }
    } else if (!Number.isFinite(details.membershipFrom) || details.membershipFrom <= 0 || details.membershipFrom > 10000000) {
      throw new HttpsError("invalid-argument", "Enter a valid facility starting price.");
    }
    const filePrefix = `stagedApplications/${uid}/${idempotencyKey}/`;
    const privateDocuments = cleanFileReferences(input.privateDocuments, filePrefix, "private document", [
      "certificate", "certificates", "kraPin", "businessRegistration", "license", "other",
    ]);
    const publicMedia = cleanFileReferences(input.publicMedia, filePrefix, "public media", [
      "profilePhoto", "coverImage", "galleryImage",
    ]);
    const coverCount = publicMedia.filter((item) => item.kind === "coverImage").length;
    const galleryCount = publicMedia.filter((item) => item.kind === "galleryImage").length;
    const profileCount = publicMedia.filter((item) => item.kind === "profilePhoto").length;
    if (type === "trainer" && (profileCount !== 1 || publicMedia.length !== 1)) throw new HttpsError("invalid-argument", "Trainers require exactly one profile photo.");
    if (type !== "trainer" && (coverCount !== 1 || galleryCount > 8 || publicMedia.length !== coverCount + galleryCount)) throw new HttpsError("invalid-argument", "Facilities require one cover image and up to eight gallery images.");
    const payment = cleanPaymentProof(input.paymentProof, plan);
    const applicationId = `${uid}_${idempotencyKey}`;
    const applicationRef = db.doc(`providerApplications/${applicationId}`);
    const paymentProofRef = payment ? db.doc(`mpesaPaymentProofs/${payment.transactionCode}`) : null;
    const applicationStatus = plan.membershipEligible ? "pending_payment_confirmation" : "pending_review";

    try {
      const submission = await db.runTransaction(async (transaction) => {
        const existing = await transaction.get(applicationRef);
        if (existing.exists) {
          if (existing.data()?.ownerUid !== uid) throw new HttpsError("permission-denied", "Registration key is already in use.");
          return {
            applicationId,
            membershipEligible: existing.data().membershipEligible === true,
            status: existing.data().applicationStatus,
          };
        }
        if (paymentProofRef) {
          const existingPayment = await transaction.get(paymentProofRef);
          if (existingPayment.exists && existingPayment.data()?.applicationId !== applicationId) {
            throw new HttpsError("already-exists", "This M-Pesa transaction code has already been submitted.");
          }
        }
        transaction.create(applicationRef, {
          schemaVersion: 1,
          ownerUid: uid,
          authType: signInProvider === "anonymous" ? "anonymous" : "account",
          type,
          planId,
          planName: plan.name,
          planPriceKes: plan.priceKes,
          membershipEligible: plan.membershipEligible,
          details,
          publicProfile: cleanRecord(input.publicProfile),
          privateDocuments,
          publicMedia,
          payment,
          applicationStatus,
          approved: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        if (paymentProofRef) {
          transaction.create(paymentProofRef, {
            applicationId,
            ownerUid: uid,
            transactionCode: payment.transactionCode,
            amountKes: payment.amountKes,
            status: "pending_confirmation",
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        transaction.set(db.doc(`users/${uid}`), {
          email: details.email,
          name: details.ownerName,
          role: "provider",
          registrationType: type,
          selectedPlanId: planId,
          membershipEligible: plan.membershipEligible,
          membershipStatus: plan.membershipEligible ? "pending_payment_confirmation" : "listing_pending",
          applicationId,
          accountStatus: "pending_approval",
          approved: false,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        return { applicationId, membershipEligible: plan.membershipEligible, status: applicationStatus };
      });
      return submission;
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error("Provider application submission failed", { uid, error });
      throw new HttpsError("internal", "We could not save this registration. Please try again.");
    }

  },
);

async function publishMedia(files, ownerUid, providerId) {
  const bucket = getStorage().bucket();
  const published = [];
  for (const [index, file] of files.entries()) {
    const extension = file.path.includes(".") ? `.${file.path.split(".").pop().replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}` : "";
    // A deterministic destination makes approval retries safe: the same staged
    // file overwrites the same object instead of creating duplicate public media.
    const destination = `public/providers/${ownerUid}/${providerId}/media-${index}${extension}`;
    await bucket.file(file.path).copy(bucket.file(destination));
    published.push(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media`);
  }
  return published;
}

export const reviewProviderApplication = onCall(
  { region: "europe-west1" },
  async (request) => {
    if (!request.auth || !(await isAdmin(request.auth.uid, request.auth.token))) {
      throw new HttpsError("permission-denied", "Administrator access is required.");
    }
    const applicationId = requiredString(request.data?.applicationId, "application ID", 180);
    const decision = requiredString(request.data?.decision, "decision", 20).toLowerCase();
    if (!["approved", "rejected"].includes(decision)) throw new HttpsError("invalid-argument", "Decision must be approved or rejected.");
    const applicationRef = db.doc(`providerApplications/${applicationId}`);
    const providerId = applicationId;
    const reservation = await db.runTransaction(async (transaction) => {
      const current = await transaction.get(applicationRef);
      if (!current.exists) throw new HttpsError("not-found", "Application was not found.");
      const currentData = current.data();
      if (["approved", "rejected"].includes(currentData.applicationStatus)) {
        if (currentData.applicationStatus !== decision) {
          throw new HttpsError("failed-precondition", `Application is already ${currentData.applicationStatus}.`);
        }
        return { completed: true, application: currentData };
      }
      if (currentData.applicationStatus === "reviewing") {
        if (currentData.reviewDecision !== decision) {
          throw new HttpsError("aborted", "A different review decision is already in progress.");
        }
        return { completed: false, application: currentData };
      }
      if (!["pending_review", "pending_payment_confirmation"].includes(currentData.applicationStatus)) {
        throw new HttpsError("failed-precondition", "Application cannot be reviewed in its current state.");
      }
      transaction.update(applicationRef, {
        applicationStatus: "reviewing",
        reviewDecision: decision,
        reviewStartedAt: FieldValue.serverTimestamp(),
        reviewedBy: request.auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { completed: false, application: currentData };
    });
    if (reservation.completed) {
      return { applicationId, providerId: decision === "approved" ? providerId : null, status: decision };
    }

    const application = reservation.application;
    const media = decision === "approved" ? await publishMedia(application.publicMedia || [], application.ownerUid, providerId) : [];
    const reviewedAt = FieldValue.serverTimestamp();

    const finalized = await db.runTransaction(async (transaction) => {
      const current = await transaction.get(applicationRef);
      if (!current.exists) throw new HttpsError("not-found", "Application was not found.");
      const currentData = current.data();
      if (["approved", "rejected"].includes(currentData.applicationStatus)) {
        if (currentData.applicationStatus !== decision) throw new HttpsError("aborted", "Application review changed.");
        return false;
      }
      if (currentData.applicationStatus !== "reviewing" || currentData.reviewDecision !== decision) {
        throw new HttpsError("aborted", "Application review changed.");
      }
      transaction.update(applicationRef, {
        applicationStatus: decision,
        approved: decision === "approved",
        reviewNotes: optionalString(request.data?.notes, 2000),
        reviewedAt,
        reviewedBy: request.auth.uid,
        updatedAt: reviewedAt,
        ...(application.payment ? { "payment.status": decision === "approved" ? "confirmed" : "rejected" } : {}),
      });
      if (application.payment?.transactionCode) {
        transaction.update(db.doc(`mpesaPaymentProofs/${application.payment.transactionCode}`), {
          status: decision === "approved" ? "confirmed" : "rejected",
          reviewedAt,
          reviewedBy: request.auth.uid,
        });
      }
      if (decision === "approved") {
        transaction.create(db.doc(`providers/${providerId}`), {
          ...publicProviderData(application),
          type: application.type,
          ownerUid: application.ownerUid,
          plan: application.planId,
          planName: application.planName,
          membershipEligible: application.membershipEligible,
          approved: true,
          status: "verified",
          ...providerMediaData(application, media),
          rating: 0,
          ratingTotal: 0,
          reviewCount: 0,
          createdAt: reviewedAt,
          updatedAt: reviewedAt,
        });
      }
      const membershipWindow = decision === "approved" ? newMembershipWindow() : null;
      transaction.set(db.doc(`users/${application.ownerUid}`), {
        providerId: decision === "approved" ? providerId : null,
        membershipStatus: decision === "approved"
          ? (application.membershipEligible ? "active" : "listing_active")
          : "rejected",
        dashboardTier: application.membershipEligible ? "full" : "limited",
        accountStatus: decision === "approved" ? "active" : "rejected",
        approved: decision === "approved",
        membershipActivatedAt: membershipWindow?.membershipActivatedAt || FieldValue.delete(),
        membershipExpiresAt: membershipWindow?.membershipExpiresAt || FieldValue.delete(),
        updatedAt: reviewedAt,
      }, { merge: true });
      return true;
    });
    return { applicationId, providerId: decision === "approved" ? providerId : null, status: decision, finalized };
  },
);

// Firebase Console reviews do not pass through the callable above. Complete
// all linked records when an administrator changes approved from false to true.
export const publishApprovedProviderApplication = onDocumentUpdated(
  { document: "providerApplications/{applicationId}", region: "europe-west1", secrets: [resendApiKey] },
  async (event) => {
    const before = event.data?.before.data();
    const application = event.data?.after.data();
    if (!application || before?.approved === true || application.approved !== true) return;
    if (application.applicationStatus === "rejected") {
      logger.warn("Ignored approval flag on rejected provider application", { applicationId: event.params.applicationId });
      return;
    }

    const applicationId = event.params.applicationId;
    const applicationRef = event.data.after.ref;
    const providerRef = db.doc(`providers/${applicationId}`);
    const userRef = db.doc(`users/${application.ownerUid}`);
    const existingProvider = await providerRef.get();
    const media = existingProvider.exists
      ? (existingProvider.data()?.photos || [])
      : await publishMedia(application.publicMedia || [], application.ownerUid, applicationId);
    const reviewedAt = FieldValue.serverTimestamp();
    const membershipWindow = newMembershipWindow();

    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(applicationRef);
      if (!current.exists || current.data()?.approved !== true) return;

      if (!existingProvider.exists) {
        transaction.create(providerRef, {
          ...publicProviderData(application),
          type: application.type,
          ownerUid: application.ownerUid,
          plan: application.planId,
          planName: application.planName,
          membershipEligible: application.membershipEligible === true,
          approved: true,
          status: "verified",
          ...providerMediaData(application, media),
          rating: 0,
          ratingTotal: 0,
          reviewCount: 0,
          createdAt: reviewedAt,
          updatedAt: reviewedAt,
        });
      }

      transaction.update(applicationRef, {
        applicationStatus: "approved",
        reviewedAt,
        updatedAt: reviewedAt,
      });
      transaction.set(userRef, {
        providerId: applicationId,
        approved: true,
        accountStatus: "active",
        membershipStatus: application.membershipEligible === true ? "active" : "listing_active",
        dashboardTier: application.membershipEligible === true ? "full" : "limited",
        membershipActivatedAt: membershipWindow.membershipActivatedAt,
        membershipExpiresAt: membershipWindow.membershipExpiresAt,
        updatedAt: reviewedAt,
      }, { merge: true });
    });

    logger.info("Console-approved provider application published", {
      applicationId,
      membershipEligible: application.membershipEligible === true,
    });
  },
);

export const createBooking = onCall(
  { region: "europe-west1", invoker: "public" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Log in to submit a booking.");
    const input = request.data || {};
    const providerId = requiredString(input.providerId, "provider", 180);
    const service = requiredString(input.service, "service", 160);
    const note = optionalString(input.note, 500);
    const scheduledDate = new Date(requiredString(input.scheduledAt, "appointment date", 50));
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) throw new HttpsError("invalid-argument", "Choose a future appointment date and time.");
    if (scheduledDate.getTime() > Date.now() + 366 * 86400000) throw new HttpsError("invalid-argument", "Appointments can be booked up to one year ahead.");
    const transactionCode = requiredString(input.transactionCode, "M-Pesa transaction code", 12).toUpperCase();
    if (!/^[A-Z0-9]{10,12}$/.test(transactionCode)) throw new HttpsError("invalid-argument", "Enter a valid 10–12 character M-Pesa transaction code.");
    const payerPhone = normalizedKenyanPhone(input.payerPhone, "payment phone", true);
    const [providerSnap, userSnap] = await Promise.all([db.doc(`providers/${providerId}`).get(), db.doc(`users/${request.auth.uid}`).get()]);
    if (!providerSnap.exists || providerSnap.data()?.approved !== true) throw new HttpsError("not-found", "This provider is not available for bookings.");
    const provider = providerSnap.data();
    const amountKes = Number(provider.type === "trainer" ? provider.pricePerHour : provider.type === "gym" ? provider.membershipFrom : provider.type === "academy" ? provider.registrationFrom || provider.membershipFrom : provider.sessionFrom || provider.membershipFrom);
    if (!Number.isFinite(amountKes) || amountKes <= 0) throw new HttpsError("failed-precondition", "This provider does not have a valid booking price.");
    const bookingRef = db.collection("bookings").doc();
    const paymentRef = db.doc(`bookingPaymentProofs/${transactionCode}`);
    await db.runTransaction(async (transaction) => {
      if ((await transaction.get(paymentRef)).exists) throw new HttpsError("already-exists", "This M-Pesa transaction code has already been submitted.");
      transaction.create(paymentRef, { bookingId: bookingRef.id, clientId: request.auth.uid, createdAt: FieldValue.serverTimestamp() });
      transaction.create(bookingRef, {
        clientId: request.auth.uid,
        clientName: userSnap.data()?.name || request.auth.token?.name || "FitLink client",
        providerId,
        providerOwnerUid: provider.ownerUid,
        providerName: provider.name,
        providerType: provider.type,
        service,
        note,
        scheduledAt: Timestamp.fromDate(scheduledDate),
        amountKes,
        paymentMethod: "manual_mpesa",
        payerPhone,
        transactionCode,
        paymentStatus: "pending_manual_verification",
        status: "pending",
        reviewSubmitted: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    return { bookingId: bookingRef.id, status: "pending" };
  },
);

export const updateBookingStatus = onCall(
  { region: "europe-west1", invoker: "public" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Sign in to manage bookings.");
    const bookingId = requiredString(request.data?.bookingId, "booking ID", 180);
    const nextStatus = requiredString(request.data?.status, "status", 20).toLowerCase();
    const bookingRef = db.doc(`bookings/${bookingId}`);
    await db.runTransaction(async (transaction) => {
      const [bookingSnap, accountSnap] = await Promise.all([transaction.get(bookingRef), transaction.get(db.doc(`users/${request.auth.uid}`))]);
      if (!bookingSnap.exists) throw new HttpsError("not-found", "Booking not found.");
      const booking = bookingSnap.data();
      const admin = request.auth.token?.admin === true || accountSnap.data()?.role === "admin";
      if (booking.providerOwnerUid !== request.auth.uid && !admin) throw new HttpsError("permission-denied", "Only this provider can update the booking.");
      const expiresAt = accountSnap.data()?.membershipExpiresAt?.toMillis?.() || 0;
      if (!admin && expiresAt && expiresAt <= Date.now()) throw new HttpsError("failed-precondition", "Renew your membership to manage booking requests.");
      if (!bookingTransitions[booking.status]?.includes(nextStatus)) throw new HttpsError("failed-precondition", `A ${booking.status} booking cannot move to ${nextStatus}.`);
      const timestampField = nextStatus === "confirmed" ? "confirmedAt" : nextStatus === "completed" ? "completedAt" : "cancelledAt";
      transaction.update(bookingRef, { status: nextStatus, [timestampField]: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });
    return { bookingId, status: nextStatus };
  },
);

export const submitVerifiedReview = onCall(
  { region: "europe-west1", invoker: "public" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Sign in to submit a review.");
    const bookingId = requiredString(request.data?.bookingId, "booking ID", 180);
    const rating = Number(request.data?.rating);
    const text = requiredString(request.data?.text, "review", 1000);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpsError("invalid-argument", "Rating must be an integer from 1 to 5.");
    if (text.length < 10) throw new HttpsError("invalid-argument", "Write at least 10 characters about your experience.");
    const bookingRef = db.doc(`bookings/${bookingId}`);
    await db.runTransaction(async (transaction) => {
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists) throw new HttpsError("not-found", "Booking not found.");
      const booking = bookingSnap.data();
      if (booking.clientId !== request.auth.uid) throw new HttpsError("permission-denied", "Only the booking client can review this appointment.");
      if (!["confirmed", "completed"].includes(booking.status) || !booking.confirmedAt || !booking.scheduledAt) throw new HttpsError("failed-precondition", "This booking is not eligible for a review.");
      const unlocksAt = Math.max(booking.confirmedAt.toMillis(), booking.scheduledAt.toMillis()) + reviewDelayMs;
      if (Date.now() < unlocksAt) throw new HttpsError("failed-precondition", `Reviews unlock on ${new Date(unlocksAt).toISOString()}.`);
      const providerRef = db.doc(`providers/${booking.providerId}`);
      const reviewRef = db.doc(`providers/${booking.providerId}/reviews/${bookingId}`);
      const [providerSnap, reviewSnap] = await Promise.all([transaction.get(providerRef), transaction.get(reviewRef)]);
      if (!providerSnap.exists) throw new HttpsError("not-found", "Provider not found.");
      if (reviewSnap.exists || booking.reviewSubmitted === true) throw new HttpsError("already-exists", "This booking already has a review.");
      const provider = providerSnap.data();
      const reviewCount = Number(provider.reviewCount || 0);
      const ratingTotal = Number(provider.ratingTotal || (Number(provider.rating || 0) * reviewCount));
      const nextCount = reviewCount + 1;
      const nextTotal = ratingTotal + rating;
      transaction.create(reviewRef, { bookingId, providerId: booking.providerId, clientId: request.auth.uid, clientName: booking.clientName || request.auth.token?.name || "FitLink customer", rating, text, verified: true, createdAt: FieldValue.serverTimestamp() });
      transaction.update(providerRef, { rating: nextTotal / nextCount, ratingTotal: nextTotal, reviewCount: nextCount, updatedAt: FieldValue.serverTimestamp() });
      transaction.update(bookingRef, { reviewSubmitted: true, reviewRating: rating, reviewText: text, reviewedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });
    return { bookingId, verified: true };
  },
);

export const notifyProviderRegistration = onDocumentCreated(
  { document: "providerApplications/{applicationId}", region: "europe-west1", secrets: [resendApiKey] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    const applicationId = event.params.applicationId;
    const notification = {};
    try {
      await sendRegistrationEmail(`New ${plain(data.type)} registration: ${plain(data.details?.name)}`, {
        "Application ID": applicationId,
        Type: data.type,
        Name: data.details?.name,
        "Contact person": data.details?.ownerName,
        Email: data.details?.email,
        Phone: data.details?.phone,
        Location: data.details?.location,
        Plan: data.planName || data.planId,
        "Amount (KES)": data.payment?.amountKes || "Listing-only application",
        "M-Pesa code": data.payment?.transactionCode,
        "Payer phone": data.payment?.payerPhone,
        Status: data.applicationStatus,
        Approved: data.approved,
      });
      notification.admin = { status: "sent", sentAt: FieldValue.serverTimestamp(), lastError: null };
      logger.info("Provider registration admin notification sent", { applicationId });
    } catch (error) {
      notification.admin = { status: "failed", failedAt: FieldValue.serverTimestamp(), lastError: "Email delivery failed" };
      logger.error("Provider registration admin notification failed", { applicationId, error });
    }

    const applicantEmail = data.details?.email;
    if (applicantEmail) {
      const subject = data.membershipEligible
        ? "FitLink registration received — await confirmation"
        : "FitLink listing application received";
      const body = data.membershipEligible
        ? `<h2>Registration received</h2><p>Thank you for applying for the ${safe(data.planName || data.planId)} plan.</p><p>FitLink will manually verify your M-Pesa payment and application details. Please wait for the confirmation email before logging in to access membership features.</p>`
        : "<h2>Listing application received</h2><p>Thank you for submitting your provider details. FitLink will review them before your listing can appear online.</p><p>This listing application does not include member dashboard access. We will email you when the review is complete.</p>";
      try {
        await sendApplicantEmail(applicantEmail, subject, body);
        notification.applicant = { status: "sent", sentAt: FieldValue.serverTimestamp(), lastError: null };
        logger.info("Provider registration applicant acknowledgement sent", { applicationId });
      } catch (error) {
        notification.applicant = { status: "failed", failedAt: FieldValue.serverTimestamp(), lastError: "Email delivery failed" };
        logger.error("Provider registration applicant acknowledgement failed", { applicationId, error });
      }
    } else {
      notification.applicant = { status: "skipped", lastError: "No applicant email was provided" };
    }

    await event.data.ref.set({
      notifications: { submission: notification },
      notificationUpdatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  },
);

export const notifyProviderReview = onDocumentUpdated(
  { document: "providerApplications/{applicationId}", region: "europe-west1" },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!after || before?.applicationStatus === after.applicationStatus || !["approved", "rejected"].includes(after.applicationStatus)) return;
    const email = after.details?.email;
    if (!email) return;
    if (after.applicationStatus === "approved") {
      const loginCopy = after.membershipEligible
        ? "Your payment and application are confirmed. You can now log in to access your provider membership."
        : "Your listing has been approved and can now appear on FitLink.";
      await sendApplicantEmail(email, "Your FitLink registration is approved", `<h2>Registration approved</h2><p>${loginCopy}</p>`);
    } else {
      await sendApplicantEmail(email, "Update on your FitLink registration", "<h2>Registration update</h2><p>We could not approve your application at this time. Please contact FitLink support for assistance.</p>");
    }
    logger.info("Provider review notification sent", { applicationId: event.params.applicationId, status: after.applicationStatus });
  },
);

export const notifyClientRegistration = onDocumentCreated(
  { document: "users/{uid}", region: "europe-west1", secrets: [resendApiKey] },
  async (event) => {
    const data = event.data?.data();
    if (!data || data.role !== "client") return;
    await sendRegistrationEmail(`New client registration: ${plain(data.name)}`, {
      "User ID": event.params.uid,
      Name: data.name,
      Email: data.email,
      Phone: data.phone,
      Role: data.role,
    });
    logger.info("Client registration notification sent", { uid: event.params.uid });
  },
);
