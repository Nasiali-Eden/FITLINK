export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatAdminDate(value) {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(date) : "Not recorded";
}

export function mapSnapshot(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function filterUsers(users, { search = "", role = "all", status = "all" } = {}) {
  const needle = search.trim().toLowerCase();
  return users.filter((user) => {
    const matchesText = !needle || [user.name, user.email, user.phone].some((value) => String(value || "").toLowerCase().includes(needle));
    const userStatus = user.accountStatus || (user.approved === false ? "pending_approval" : "active");
    return matchesText && (role === "all" || user.role === role) && (status === "all" || userStatus === status);
  });
}

export function filterApplications(applications, { type = "all", status = "all" } = {}) {
  const pending = new Set(["pending_review", "pending_payment_confirmation"]);
  return applications.filter((item) => (type === "all" || item.type === type) && (status === "all" || (status === "pending" ? pending.has(item.applicationStatus) : item.applicationStatus === status)))
    .sort((a, b) => Number(pending.has(b.applicationStatus)) - Number(pending.has(a.applicationStatus)) || (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
}
