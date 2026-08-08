import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase.js";

const functions = getFunctions(app, "europe-west1");

export async function createBooking(input) {
  const response = await httpsCallable(functions, "createBooking")(input);
  return response.data;
}

export async function updateBookingStatus(bookingId, status) {
  const response = await httpsCallable(functions, "updateBookingStatus")({ bookingId, status });
  return response.data;
}

export async function submitVerifiedReview(bookingId, rating, text) {
  const response = await httpsCallable(functions, "submitVerifiedReview")({ bookingId, rating, text });
  return response.data;
}

export function friendlyBookingError(error) {
  const code = String(error?.code || "");
  if (code.includes("unauthenticated")) return "Log in or create an account to finish this booking.";
  if (code.includes("already-exists")) return "This M-Pesa confirmation code has already been submitted. Do not pay again.";
  if (code.includes("failed-precondition")) return error?.message || "This booking cannot be updated yet.";
  if (code.includes("invalid-argument")) return error?.message || "Check the booking details and try again.";
  return "We could not save this booking. Please check the details and try again.";
}
