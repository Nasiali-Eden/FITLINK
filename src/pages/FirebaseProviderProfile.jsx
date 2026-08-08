import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { CalendarCheck, MapPin, Shield, Star } from "lucide-react";
import { Card, Button, Stars } from "../components/Ui.jsx";
import PaymentModal from "../components/PaymentModal.jsx";
import ProviderGallery from "../components/ProviderGallery.jsx";
import { useProvider } from "../hooks/useProviders.js";
import { db } from "../lib/firebase.js";

const directory = { trainer: ["/find-trainer", "Find Trainer"], gym: ["/find-gym", "Find Gym"], academy: ["/find-academy", "Find Academy"], wellness: ["/find-wellness", "Find Wellness"] };

export default function FirebaseProviderProfile({ expectedType }) {
  const { id } = useParams();
  const { provider, loading, error } = useProvider(id);
  const [bookingOpen, setBookingOpen] = useState(() => new URLSearchParams(window.location.search).get("book") === "1");
  const [reviews, setReviews] = useState([]);
  const type = provider?.type || expectedType;
  const [backTo, backLabel] = directory[type] || ["/", "Home"];

  useEffect(() => {
    if (!id) return undefined;
    return onSnapshot(query(collection(db, "providers", id, "reviews"), orderBy("createdAt", "desc")), (snapshot) => setReviews(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), () => setReviews([]));
  }, [id]);

  if (loading) return <div className="flex-1 container py-24 text-center text-slate-500">Loading approved provider…</div>;
  if (error || !provider || (expectedType && provider.type !== expectedType)) return <div className="flex-1 container py-24 text-center"><h1 className="text-2xl font-bold text-secondary">Provider not found</h1><p className="mt-2 text-slate-600">This profile may still be waiting for approval.</p><Button to={backTo} className="mt-6">{backLabel}</Button></div>;

  const price = type === "trainer" ? provider.price : type === "gym" ? provider.membership : type === "academy" ? provider.registration : provider.sessionFrom;
  const priceUnit = type === "trainer" ? "/hr" : type === "wellness" ? "/session" : "/month";
  const phone = String(provider.phone || "+254717506729").replace(/\D/g, "").replace(/^0/, "254");
  return <>
    <section className="min-w-0 bg-gradient-to-r from-secondary to-primary py-10 text-white"><div className="container min-w-0"><p className="mb-2 break-words text-sm text-white/80 [overflow-wrap:anywhere]"><Link to={backTo} className="hover:underline">{backLabel}</Link> / {provider.name}</p><div className="flex min-w-0 flex-wrap items-center gap-3"><h1 className="min-w-0 break-words text-3xl font-bold [overflow-wrap:anywhere] sm:text-4xl">{provider.name}</h1>{provider.approved && <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><Shield size={13} /> FitLink approved</span>}</div><p className="mt-2 flex min-w-0 items-start gap-2 break-words text-white/90 [overflow-wrap:anywhere]"><MapPin className="mt-0.5 shrink-0" size={16} /><span className="min-w-0">{provider.location}</span></p></div></section>
    <main className="container grid min-w-0 flex-1 gap-8 overflow-hidden py-8 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:overflow-visible lg:py-12">
      <div className="min-w-0 space-y-8"><ProviderGallery provider={provider} /><Card className="min-w-0 gap-0 p-6"><div className="mb-5 flex min-w-0 flex-wrap items-center gap-2"><Stars rating={provider.rating} /><strong className="text-secondary">{provider.rating.toFixed(1)}</strong><span className="break-words text-sm text-slate-600 [overflow-wrap:anywhere]">({provider.reviews} verified reviews)</span></div>{provider.bio && <p className="min-w-0 break-words leading-7 text-slate-700 [overflow-wrap:anywhere]">{provider.bio}</p>}<div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2"><Info label={type === "trainer" ? "Specialty" : "Services"} value={type === "trainer" ? provider.specialty : provider.services || "Contact provider for details"} /><Info label="Location" value={provider.location} />{provider.openingHours && <Info label="Opening hours" value={provider.openingHours} />}</div>{provider.mapUrl && <a href={provider.mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex max-w-full break-all font-semibold text-primary hover:underline">Open location in Google Maps</a>}</Card>
        <section className="min-w-0" aria-labelledby="reviews-title"><div className="flex min-w-0 items-end justify-between"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">From completed bookings</p><h2 id="reviews-title" className="mt-1 break-words text-2xl font-bold text-secondary [overflow-wrap:anywhere]">Verified customer reviews</h2></div></div>{reviews.length ? <div className="mt-4 min-w-0 divide-y overflow-hidden rounded-xl border bg-white">{reviews.map((review) => <article key={review.id} className="min-w-0 p-5 sm:p-6"><div className="flex min-w-0 flex-wrap items-center gap-3"><Stars rating={review.rating} /><strong className="min-w-0 break-words text-secondary [overflow-wrap:anywhere]">{review.clientName || "FitLink customer"}</strong><span className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-1 text-xs font-bold text-emerald-800"><Shield size={12} /> Verified booking</span></div><p className="mt-3 min-w-0 break-words leading-6 text-slate-700 [overflow-wrap:anywhere]">{review.text}</p></article>)}</div> : <Card className="mt-4 min-w-0 items-center gap-0 p-8 text-center"><Star className="text-slate-300" /><h3 className="mt-3 font-bold text-secondary">No verified reviews yet</h3><p className="mt-1 break-words text-sm text-slate-600 [overflow-wrap:anywhere]">Reviews unlock three days after a confirmed appointment.</p></Card>}</section>
      </div>
      <aside className="min-w-0"><Card className="sticky top-20 min-w-0 gap-0 p-6"><p className="text-sm text-slate-500">{type === "trainer" ? "Session rate" : "Prices from"}</p><p className="mb-5 break-words text-3xl font-bold text-primary [overflow-wrap:anywhere]">KSh {Number(price).toLocaleString()}<span className="text-base font-medium text-slate-500">{priceUnit}</span></p><Button size="lg" variant="primary" className="mb-3 w-full" onClick={() => setBookingOpen(true)}><CalendarCheck size={18} /> Book now</Button><Button variant="outline" className="w-full" href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${provider.name}, I found you on FitLink Kenya`)}`}>Message on WhatsApp</Button><p className="mt-4 break-words text-center text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">Pay using M-Pesa Send Money after choosing an appointment. FitLink checks the confirmation code before the booking is finalized.</p></Card></aside>
    </main>
    <PaymentModal open={bookingOpen} onClose={() => setBookingOpen(false)} provider={provider} amount={price} />
  </>;
}

function Info({ label, value }) { return <div className="min-w-0 rounded-lg bg-slate-50 p-4"><p className="break-words text-xs font-semibold uppercase tracking-wide text-slate-500 [overflow-wrap:anywhere]">{label}</p><p className="mt-1 min-w-0 break-words font-semibold text-secondary [overflow-wrap:anywhere]">{value}</p></div>; }
