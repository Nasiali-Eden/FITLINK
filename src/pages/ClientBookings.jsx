import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { CalendarDays, CheckCircle2, Clock3, MessageSquareText, Star } from "lucide-react";
import { Button, Card, Stars } from "../components/Ui.jsx";
import { auth, db } from "../lib/firebase.js";
import { isReviewEligible, reviewUnlockTime, validateRatingReview } from "../lib/bookingRules.js";
import { submitVerifiedReview } from "../lib/bookings.js";

const money = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" });
const toDate = (value) => value?.toDate?.() || (value ? new Date(value) : null);

export default function ClientBookings() {
  const [state, setState] = useState({ loading: true, user: null, bookings: [], error: "" });
  useEffect(() => {
    let stop = () => {};
    return onAuthStateChanged(auth, (user) => {
      stop();
      if (!user) { setState({ loading: false, user: null, bookings: [], error: "" }); return; }
      stop = onSnapshot(query(collection(db, "bookings"), where("clientId", "==", user.uid)), (snapshot) => setState({ loading: false, user, bookings: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0)), error: "" }), (error) => setState({ loading: false, user, bookings: [], error: error.message }));
    });
  }, []);
  if (state.loading) return <State icon={Clock3} title="Loading your bookings">Fetching your private booking history…</State>;
  if (!state.user) return <State title="Sign in to view your bookings"><Button to="/login?returnTo=%2Fmy-bookings" variant="primary" className="mt-5">Log in</Button></State>;
  return <main className="flex-1 bg-slate-50 py-10 sm:py-14"><div className="container max-w-5xl"><header><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Client area</p><h1 className="mt-2 text-3xl font-bold text-secondary sm:text-4xl">My bookings</h1><p className="mt-2 text-slate-600">Track provider confirmation, manual payment checks, and verified review access.</p></header>{state.error && <p role="alert" className="mt-6 rounded-md bg-red-50 p-4 text-red-700">We could not load your bookings.</p>}{!state.bookings.length ? <Card className="mt-8 items-center gap-0 p-10 text-center"><CalendarDays className="text-slate-300" size={38} /><h2 className="mt-4 text-xl font-bold text-secondary">No bookings yet</h2><p className="mt-2 text-sm text-slate-600">Choose a verified provider to make your first request.</p><Button to="/find-trainer" variant="primary" className="mt-5">Browse providers</Button></Card> : <div className="mt-8 grid gap-5">{state.bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}</div>}</div></main>;
}

function BookingCard({ booking }) {
  const [rating, setRating] = useState(0); const [text, setText] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const unlock = reviewUnlockTime(booking); const eligible = isReviewEligible(booking);
  const submit = async (event) => { event.preventDefault(); const validation = validateRatingReview(rating, text); if (validation) { setError(validation); return; } setSaving(true); setError(""); try { await submitVerifiedReview(booking.id, Number(rating), text.trim()); } catch (problem) { setError(problem.message || "We could not submit this review."); } finally { setSaving(false); } };
  return <Card className="gap-0 overflow-hidden"><div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto]"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-secondary">{booking.providerName}</h2><span className={`rounded-md px-2 py-1 text-xs font-bold capitalize ${booking.status === "completed" ? "bg-primary-soft text-emerald-800" : booking.status === "confirmed" ? "bg-secondary-soft text-secondary" : booking.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-accent-soft text-amber-800"}`}>{booking.status}</span></div><p className="mt-1 font-medium text-slate-700">{booking.service}</p><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Scheduled</dt><dd className="font-semibold text-secondary">{toDate(booking.scheduledAt) ? dateTime.format(toDate(booking.scheduledAt)) : "Not set"}</dd></div><div><dt className="text-slate-500">Amount</dt><dd className="font-semibold text-secondary">{money.format(Number(booking.amountKes || 0))}</dd></div><div><dt className="text-slate-500">Payment</dt><dd className="font-semibold capitalize text-secondary">{String(booking.paymentStatus || "pending verification").replaceAll("_", " ")}</dd></div><div><dt className="text-slate-500">Booking ID</dt><dd className="font-mono text-xs text-secondary">{booking.id}</dd></div></dl></div><Button to={`/${booking.providerType === "wellness" ? "wellness" : booking.providerType}/${booking.providerId}`} variant="outline">View provider</Button></div>
    <div className="border-t bg-slate-50 p-5 sm:px-6">{booking.reviewSubmitted ? <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-primary" /><div><p className="font-bold text-secondary">Verified review submitted</p><div className="mt-1"><Stars rating={booking.reviewRating || 0} /></div><p className="mt-2 text-sm text-slate-600">{booking.reviewText}</p></div></div> : eligible ? <form onSubmit={submit}><div className="flex items-center gap-2"><MessageSquareText className="text-primary" /><h3 className="font-bold text-secondary">Review this verified booking</h3></div><fieldset className="mt-3"><legend className="sr-only">Rating</legend><div className="flex gap-1">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value === 1 ? "" : "s"}`} aria-pressed={rating === value} className="p-1 focus-visible:ring-2 focus-visible:ring-primary"><Star className={value <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} /></button>)}</div></fieldset><textarea required minLength="10" maxLength="1000" rows="3" className="field mt-3 h-auto py-3" value={text} onChange={(event) => setText(event.target.value)} placeholder="Describe your experience…" />{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}<Button type="submit" variant="primary" className="mt-3" disabled={saving}>{saving ? "Submitting…" : "Submit verified review"}</Button></form> : <p className="flex items-center gap-2 text-sm text-slate-600"><Clock3 size={17} className="text-primary" />{unlock ? `Reviews unlock ${dateTime.format(new Date(unlock))}.` : "Reviews unlock three days after the provider confirms your appointment."}</p>}</div>
  </Card>;
}

function State({ icon: Icon = CalendarDays, title, children }) { return <main className="container flex min-h-[65vh] items-center justify-center"><Card className="items-center gap-0 p-9 text-center"><Icon className="text-primary" size={34} /><h1 className="mt-4 text-2xl font-bold text-secondary">{title}</h1><div className="mt-2 text-sm text-slate-600">{children}</div></Card></main>; }
