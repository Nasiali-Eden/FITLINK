import { collection, getDocs } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "./firebase.js";
import { mapSnapshot } from "./adminHelpers.js";

export { filterApplications, filterUsers, formatAdminDate } from "./adminHelpers.js";

const functions = getFunctions(app, "europe-west1");

export async function loadAdminData() {
  const [users, applications] = await Promise.all([getDocs(collection(db, "users")), getDocs(collection(db, "providerApplications"))]);
  return { users: mapSnapshot(users), applications: mapSnapshot(applications) };
}

export async function createManagedUser(data) {
  return (await httpsCallable(functions, "createAdminManagedUser")(data)).data;
}

export async function reviewApplication(applicationId, decision, notes = "") {
  return (await httpsCallable(functions, "reviewProviderApplication")({ applicationId, decision, notes })).data;
}

export function adminErrorMessage(error) {
  if (error?.code === "functions/permission-denied" || error?.code === "permission-denied") return "Your account does not have administrator permission.";
  if (error?.code === "functions/already-exists") return error.message || "That account already exists.";
  return error?.message || "The admin service could not complete this request. Try again.";
}
