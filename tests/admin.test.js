import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { filterApplications, filterUsers, formatAdminDate } from "../src/lib/adminHelpers.js";

test("admin user filters search contact data and combine role/status", () => {
  const users = [
    { id: "a", name: "Amina Noor", email: "amina@example.com", phone: "+254700000001", role: "client", approved: true },
    { id: "b", name: "Brian Otieno", email: "brian@example.com", phone: "+254700000002", role: "provider", accountStatus: "pending_approval" },
  ];
  assert.deepEqual(filterUsers(users, { search: "700000002", role: "provider", status: "pending_approval" }).map((item) => item.id), ["b"]);
  assert.equal(filterUsers(users, { search: "AMINA" }).length, 1);
});

test("admin application filters put pending reviews before finalized decisions", () => {
  const applications = [
    { id: "approved", type: "trainer", applicationStatus: "approved", createdAt: "2026-08-16" },
    { id: "pending", type: "gym", applicationStatus: "pending_review", createdAt: "2026-08-10" },
  ];
  assert.deepEqual(filterApplications(applications).map((item) => item.id), ["pending", "approved"]);
  assert.deepEqual(filterApplications(applications, { type: "gym", status: "pending" }).map((item) => item.id), ["pending"]);
  assert.equal(formatAdminDate({ toDate: () => new Date("2026-08-16T00:00:00Z") }), "16 Aug 2026");
});

test("admin routing and trusted callable protections remain wired", async () => {
  const [app, auth, functions, adminPage] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/auth.js", import.meta.url), "utf8"),
    readFile(new URL("../functions/index.js", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/admin/AdminDashboard.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(app, /path="\/admin"/);
  assert.match(auth, /"\/admin"/);
  assert.match(functions, /export const createAdminManagedUser = onCall/);
  assert.match(functions, /await isAdmin\(request\.auth\.uid/);
  assert.match(functions, /await getAuth\(\)\.deleteUser\(authUser\.uid\)/);
  assert.match(adminPage, /reviewApplication\(item\.id, decision, notes\)/);
  assert.doesNotMatch(adminPage, /updateDoc|setDoc/);
});
