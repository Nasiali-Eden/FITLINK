import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import {
  AlertCircle, ArrowRight, CalendarDays, CircleUserRound, Clock3,
  ExternalLink, ShieldCheck, Star, TrendingUp, WalletCards,
} from "lucide-react";
import { Button, Card } from "../components/Ui.jsx";
import { auth, db } from "../lib/firebase.js";
import { dashboardAccess } from "../lib/registrationConfig.js";
import { updateBookingStatus } from "../lib/bookings.js";

const money = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric" });
const activeStatuses = new Set(["pending", "confirmed"]);
const profileFields = ["name", "phone", "location", "bio", "photo"];
const categoryNames = { trainer: "Trainer", gym: "Gym", academy: "Academy", wellness: "Wellness centre" };
const dashboardStates = new Set(["limited", "allowed", "expired"]);

function dateValue(value) {
  if (!value) return null;
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function timestampValue(value) {
  return dateValue(value)?.getTime() || 0;
}

function formatDate(value) {
  const date = dateValue(value);
  return date ? dateFormat.format(date) : "Not set";
}

function daysUntil(value) {
  const date = dateValue(value);
  if (!date) return null;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}

function statusStyle(status) {
  if (status === "completed") return "bg-primary-soft text-emerald-800";
  if (status === "confirmed") return "bg-secondary-soft text-secondary";
  if (status === "pending") return "bg-accent-soft text-amber-800";
  if (status === "cancelled") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function StatePanel({ icon: Icon = AlertCircle, title, children, action }) {
  return <div className="container py-16 sm:py-24"><Card className="mx-auto max-w-xl items-center gap-0 p-8 text-center sm:p-10"><span className="mb-5 grid size-12 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={24} /></span><h1 className="text-2xl font-bold text-secondary">{title}</h1><div className="mt-3 max-w-md text-sm leading-6 text-slate-600">{children}</div>{action && <div className="mt-6">{action}</div>}</Card></div>;
}

function Metric({ icon: Icon, label, value, detail, tone = "default" }) {
  const featured = tone === "featured";
  const urgent = tone === "urgent";
  return <Card className={`gap-0 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${featured ? "border-primary bg-secondary text-white" : urgent ? "border-red-200 bg-red-50" : ""}`}><div className="flex items-start justify-between gap-3"><div><p className={`text-sm font-semibold ${featured ? "text-emerald-100" : urgent ? "text-red-700" : "text-slate-600"}`}>{label}</p><p className={`mt-2 text-3xl font-bold tracking-tight ${featured ? "text-white" : urgent ? "text-red-800" : "text-secondary"}`}>{value}</p></div><span className={`grid size-10 shrink-0 place-items-center rounded-lg ${featured ? "bg-white/10 text-emerald-200" : urgent ? "bg-red-100 text-red-700" : "bg-primary-soft text-primary"}`}><Icon size={20} /></span></div><p className={`mt-3 text-xs ${featured ? "text-slate-300" : urgent ? "text-red-700" : "text-slate-500"}`}>{detail}</p></Card>;
}

export default function ProviderDashboard() {
  const [state, setState] = useState({ phase: "loading", access: null, user: null, account: null, provider: null, bookings: [], error: "" });

  useEffect(() => {
    let stopUser = () => {};
    let stopProvider = () => {};
    let stopBookings = () => {};
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopUser(); stopProvider(); stopBookings();
      if (!user) { setState({ phase: "signed-out", access: null, user: null, account: null, provider: null, bookings: [], error: "" }); return; }
      setState((current) => ({ ...current, phase: "loading", user }));
      stopUser = onSnapshot(doc(db, "users", user.uid), (userSnap) => {
        stopProvider(); stopBookings();
        stopProvider = () => {}; stopBookings = () => {};
        if (!userSnap.exists()) { setState({ phase: "not-provider", access: "not-provider", user, account: null, provider: null, bookings: [], error: "" }); return; }
        const account = userSnap.data();
        const access = dashboardAccess(account);
        if (access === "pending") { setState({ phase: "pending", access, user, account, provider: null, bookings: [], error: "" }); return; }
        if (!dashboardStates.has(access)) { setState({ phase: "not-provider", access, user, account, provider: null, bookings: [], error: "" }); return; }
        if (!account.providerId) { setState({ phase: "missing-provider", access, user, account, provider: null, bookings: [], error: "" }); return; }

        stopProvider = onSnapshot(doc(db, "providers", account.providerId), (providerSnap) => {
          if (!providerSnap.exists()) { setState({ phase: "missing-provider", access, user, account, provider: null, bookings: [], error: "" }); return; }
          setState((current) => ({ ...current, phase: "ready", access, user, account, provider: { id: providerSnap.id, ...providerSnap.data() } }));
        }, (error) => setState((current) => ({ ...current, phase: "error", error: error.message })));
        stopBookings = onSnapshot(query(collection(db, "bookings"), where("providerOwnerUid", "==", user.uid)), (snapshot) => {
          const bookings = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => timestampValue(b.createdAt) - timestampValue(a.createdAt));
          setState((current) => ({ ...current, bookings }));
        }, (error) => setState((current) => ({ ...current, phase: "error", error: error.message })));
      }, (error) => setState((current) => ({ ...current, phase: "error", error: error.message })));
    }, (error) => setState((current) => ({ ...current, phase: "error", error: error.message })));
    return () => { stopAuth(); stopUser(); stopProvider(); stopBookings(); };
  }, []);

  const summary = useMemo(() => {
    const completed = state.bookings.filter((item) => item.status === "completed");
    return {
      active: state.bookings.filter((item) => activeStatuses.has(item.status)).length,
      completedValue: completed.reduce((sum, item) => sum + (Number(item.amountKes) || 0), 0),
    };
  }, [state.bookings]);

  if (state.phase === "loading") return <StatePanel icon={Clock3} title="Preparing your dashboard"><p>Loading your provider profile and bookings…</p></StatePanel>;
  if (state.phase === "signed-out") return <StatePanel icon={CircleUserRound} title="Sign in to view your dashboard" action={<Button variant="primary" to="/login">Sign in <ArrowRight size={16} /></Button>}><p>Your provider activity is private and available after you sign in.</p></StatePanel>;
  if (state.phase === "not-provider") return <StatePanel title="This dashboard is for providers" action={<Button variant="primary" to="/pricing">View provider plans <ArrowRight size={16} /></Button>}><p>This account is not linked to a trainer, gym, academy, or wellness provider.</p></StatePanel>;
  if (state.phase === "pending") return <StatePanel icon={Clock3} title="Application review in progress" action={<Button variant="primary" to="/contact">Contact support</Button>}><p>Your account is safe. The dashboard will open after FitLink approves your provider profile.</p></StatePanel>;
  if (state.phase === "missing-provider") return <StatePanel title="We could not find your provider profile" action={<Button variant="primary" to="/contact">Contact support</Button>}><p>Your account is approved, but its public profile is missing or unavailable.</p></StatePanel>;
  if (state.phase === "error") return <StatePanel title="Dashboard unavailable" action={<Button variant="primary" onClick={() => window.location.reload()}>Try again</Button>}><p role="alert">We could not load your data. Please try again or contact support.</p></StatePanel>;

  const { provider, account, access } = state;
  const limited = access === "limited";
  const expired = access === "expired";
  const activation = account.membershipActivatedAt || account.membershipStartAt || provider.membershipActivatedAt;
  const expiry = account.membershipExpiresAt || provider.membershipExpiresAt;
  const remaining = daysUntil(expiry);
  const warning = !expired && remaining !== null && remaining <= 7;
  const completeCount = profileFields.filter((field) => Boolean(provider[field])).length;
  const completion = Math.round((completeCount / profileFields.length) * 100);
  const approved = provider.approved === true || provider.status === "verified" || provider.status === "approved";
  const providerType = provider.type || account.registrationType;
  const publicPath = { trainer: "trainer", gym: "gym", academy: "academy", wellness: "wellness" }[providerType];
  const displayName = provider.name || provider.businessName || state.user?.displayName || "Provider";
  const planName = account.planName || provider.planName || provider.plan || account.selectedPlanId || "Plan not listed";
  const accessName = expired ? "Expired · read-only" : limited ? "Starter access" : "Full access";
  const bookingLimit = limited ? 3 : 5;

  return <div className="min-h-full bg-[linear-gradient(180deg,#eef8f4_0,#f7fafc_22rem,#f7fafc_100%)] py-8 sm:py-12">
    <div className="container max-w-7xl">
      {expired && <div role="status" className="mb-5 flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-red-800">Your membership has expired</p><p className="mt-1 text-sm text-red-700">Your information is preserved, but this dashboard is read-only until you renew.</p></div><Button variant="primary" to="/pricing">Renew membership <ArrowRight size={16} /></Button></div>}
      {warning && <div role="status" className="mb-5 flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-amber-900">Membership renewal is due soon</p><p className="mt-1 text-sm text-amber-800">You have {remaining} day{remaining === 1 ? "" : "s"} remaining. Renew early to keep uninterrupted access.</p></div><Button variant="outline" to="/pricing">View renewal options</Button></div>}

      <header className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="h-1.5 bg-primary" />
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4"><div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-xl font-bold text-white">{provider.photo ? <img src={provider.photo} alt={`${displayName} profile`} className="size-full object-cover" /> : displayName.charAt(0).toUpperCase()}</div><div><p className="text-sm font-semibold text-primary">{categoryNames[providerType] || "Provider"} dashboard</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">Welcome, {displayName}</h1><p className="mt-2 text-sm text-slate-600">{summary.active ? `You have ${summary.active} active booking${summary.active === 1 ? "" : "s"} to follow up.` : "Your listing is ready for the next client."}</p></div></div>
          <div className="flex flex-wrap gap-2"><span className="rounded-md bg-secondary-soft px-3 py-1.5 text-xs font-bold text-secondary">{planName}</span><span className="rounded-md bg-primary-soft px-3 py-1.5 text-xs font-bold text-emerald-800">{approved ? "Approved" : "Pending"}</span><span className={`rounded-md px-3 py-1.5 text-xs font-bold ${expired ? "bg-red-100 text-red-800" : limited ? "bg-amber-100 text-amber-900" : "bg-primary text-white"}`}>{accessName}</span></div>
        </div>
        <div className="grid border-t bg-slate-50 sm:grid-cols-[1fr_auto]"><div className="flex items-center gap-3 px-6 py-4 sm:px-8"><span className={`size-2.5 shrink-0 rounded-full ${expired ? "bg-red-500 shadow-[0_0_0_5px_rgba(239,68,68,.12)]" : summary.active ? "bg-accent shadow-[0_0_0_5px_rgba(255,140,66,.14)]" : "bg-primary shadow-[0_0_0_5px_rgba(0,168,107,.12)]"}`} /><p className="text-sm font-semibold text-secondary">{expired ? "Priority: renew to restore active account tools." : summary.active ? "Priority: review active bookings and confirm the next step." : "You’re caught up. Keep your public profile fresh for new clients."}</p></div><Button variant={expired ? "outline" : "primary"} to={expired ? "/pricing" : summary.active ? "#recent-bookings" : publicPath ? `/${publicPath}/${provider.id}` : "/contact"} className="m-3 sm:my-2">{expired ? "Renew now" : summary.active ? "Review bookings" : "View profile"}<ArrowRight size={15} /></Button></div>
      </header>

      <section aria-labelledby="metrics-heading" className="mt-8"><h2 id="metrics-heading" className="sr-only">Business summary</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric tone={expired ? "urgent" : "featured"} icon={Clock3} label="Membership" value={remaining === null ? "Not set" : expired ? "Expired" : `${remaining} days`} detail={remaining === null ? "Contact support to confirm your expiry date" : expired ? `Expired ${formatDate(expiry)}` : "remaining until renewal"} /><Metric icon={CalendarDays} label="Active bookings" value={summary.active} detail="Pending or confirmed client requests" /><Metric icon={WalletCards} label={limited ? "Total bookings" : "Completed value"} value={limited ? state.bookings.length : money.format(summary.completedValue)} detail={limited ? "All bookings received on FitLink" : "Gross value of completed bookings"} /><Metric icon={Star} label="Provider rating" value={provider.reviewCount ? Number(provider.rating || 0).toFixed(1) : "—"} detail={`${Number(provider.reviewCount || 0)} verified review${Number(provider.reviewCount || 0) === 1 ? "" : "s"}`} /></div></section>

      <div id="recent-bookings" className="mt-8 grid scroll-mt-24 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.75fr)]">
        <section aria-labelledby="bookings-heading"><Card className="gap-0 overflow-hidden"><div className="flex items-end justify-between border-b p-5 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Client activity</p><h2 id="bookings-heading" className="mt-1 text-xl font-bold text-secondary">Recent bookings</h2></div><span className="text-xs text-slate-500">Latest {bookingLimit}</span></div>{state.bookings.length === 0 ? <div className="p-8 text-center sm:p-12"><CalendarDays className="mx-auto text-slate-300" size={34} /><h3 className="mt-4 font-bold text-secondary">No bookings yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">New client bookings and enquiries will appear here.</p></div> : <ul className="divide-y divide-slate-100">{state.bookings.slice(0, bookingLimit).map((booking) => <BookingRow key={booking.id} booking={booking} readOnly={expired} />)}</ul>}{limited && state.bookings.length > bookingLimit && <div className="border-t bg-amber-50/60 px-5 py-4 text-sm text-amber-900 sm:px-6"><span className="font-semibold">Starter view:</span> showing your {bookingLimit} most recent bookings. <a href="/pricing" className="font-bold underline underline-offset-2">Compare full plans</a>.</div>}</Card></section>

        <aside className="space-y-6" aria-label="Membership and quick actions">
          <Card className="gap-0 p-6"><div className="flex items-center gap-3"><ShieldCheck className={expired ? "text-red-600" : "text-primary"} size={22} /><h2 className="text-lg font-bold text-secondary">Membership</h2></div><dl className="mt-5 space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-600">Plan</dt><dd className="text-right font-semibold text-secondary">{planName}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Activated</dt><dd className="font-semibold text-secondary">{formatDate(activation)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Expires</dt><dd className={`font-semibold ${expired ? "text-red-700" : warning ? "text-amber-800" : "text-secondary"}`}>{formatDate(expiry)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Access</dt><dd className="text-right font-semibold text-secondary">{accessName}</dd></div></dl>{!expiry && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Your membership dates are not set yet. Contact FitLink support to confirm them.</p>}</Card>

          <Card className="gap-0 p-6"><div className="flex items-center gap-3"><TrendingUp className="text-primary" size={21} /><h2 className="text-lg font-bold text-secondary">Listing health</h2></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs font-semibold"><span>Profile completion</span><span>{completion}%</span></div><div className="h-2 overflow-hidden rounded bg-slate-100" role="progressbar" aria-label="Profile completion" aria-valuenow={completion} aria-valuemin="0" aria-valuemax="100"><div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} /></div><p className="mt-3 text-xs leading-5 text-slate-500">Keep your contact details, location, bio, and photo current.</p></div></Card>

          {limited && <Card className="gap-0 border-amber-200 bg-amber-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Starter plan</p><h2 className="mt-2 text-lg font-bold text-secondary">Ready for more tools?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Unlock full booking visibility and business value summaries when you need them.</p><Button to="/pricing" variant="outline" className="mt-4 w-full justify-between">Compare plans <ArrowRight size={16} /></Button></Card>}

          <Card className="gap-0 p-6"><h2 className="text-lg font-bold text-secondary">Quick actions</h2><div className="mt-4 grid gap-3">{publicPath && approved && <Button to={`/${publicPath}/${provider.id}`} variant="primary" className="w-full justify-between">View public profile <ExternalLink size={15} /></Button>}<Button to="/pricing" variant="secondary" className="w-full justify-between">{expired ? "Renew membership" : "Plans and renewal"} <ArrowRight size={16} /></Button><Button to="/contact" variant="ghost" className="w-full justify-between">Contact support <ArrowRight size={16} /></Button></div></Card>
        </aside>
      </div>
    </div>
  </div>;
}

function BookingRow({ booking, readOnly }) {
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const act = async (status) => { setSaving(status); setError(""); try { await updateBookingStatus(booking.id, status); } catch (problem) { setError(problem.message || "Could not update this booking."); } finally { setSaving(""); } };
  return <li className="p-5 sm:px-6"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"><div className="min-w-0"><p className="truncate font-semibold text-secondary">{booking.service || "General booking"}</p><p className="mt-1 text-xs text-slate-500">{booking.clientName || "FitLink client"}{booking.scheduledAt ? ` · ${formatDate(booking.scheduledAt)}` : ""}</p><p className="mt-1 text-xs font-medium capitalize text-slate-500">Payment: {String(booking.paymentStatus || "pending manual verification").replaceAll("_", " ")}</p></div><p className="font-bold text-secondary">{money.format(Number(booking.amountKes) || 0)}</p><span className={`w-fit rounded-md px-2.5 py-1 text-xs font-bold capitalize ${statusStyle(booking.status)}`}>{booking.status || "unknown"}</span></div>{["pending", "confirmed"].includes(booking.status) && <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">{booking.status === "pending" && <Button size="sm" variant="primary" disabled={readOnly || saving} onClick={() => act("confirmed")}>{saving === "confirmed" ? "Confirming…" : "Confirm"}</Button>}{booking.status === "confirmed" && <Button size="sm" variant="primary" disabled={readOnly || saving} onClick={() => act("completed")}>{saving === "completed" ? "Completing…" : "Mark completed"}</Button>}<Button size="sm" variant="outline" disabled={readOnly || saving} onClick={() => act("cancelled")}>Cancel</Button>{readOnly && <span className="text-xs text-red-700">Renew membership to manage bookings.</span>}{error && <span role="alert" className="text-xs text-red-700">{error}</span>}</div>}</li>;
}
