import { useParams, Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Card, Button, Stars } from "../components/Ui.jsx";

/* Shared profile page for academies & wellness centres (Manus gym-profile layout). */
export default function FacilityProfile({ getItem, backTo, backLabel, listLabel, listKey, priceLabel, priceKey, priceUnit }) {
  const { id } = useParams();
  const f = getItem(id);

  if (!f) return (
    <div className="flex-1 container py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Not found</h1>
      <Button to={backTo} className="mt-6">{backLabel}</Button>
    </div>
  );

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <p className="text-sm text-primary-foreground/80 mb-2">
            <Link to={backTo} className="hover:underline">{backLabel}</Link> / {f.name}
          </p>
          <h1 className="text-4xl font-bold">{f.name}</h1>
          <p className="text-lg text-primary-foreground/90 mt-1 flex items-center gap-2"><MapPin size={16} /> {f.location}</p>
        </div>
      </section>

      <div className="flex-1 container py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="py-0 gap-0 overflow-hidden">
            <div className="relative h-72 bg-slate-200 overflow-hidden">
              <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-1 mb-4">
                <Stars rating={f.rating} />
                <span className="text-sm font-semibold text-slate-900">{f.rating}</span>
                <span className="text-xs text-slate-600">({f.reviews} reviews)</span>
              </div>
              <div className="mb-6">
                <p className="text-xs text-slate-600 font-semibold mb-1">{listLabel}</p>
                <p className="text-slate-700">{f[listKey]}</p>
              </div>
              {f.ages && <p className="text-sm text-slate-600 mb-6">👦 {f.ages}</p>}
              <div className="rounded-lg bg-primary/5 border border-primary/20 h-48 flex items-center justify-center text-primary font-semibold">
                🗺️ Map preview — {f.location}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 gap-0 sticky top-20">
            <p className="text-xs text-slate-600 font-semibold mb-1">{priceLabel}</p>
            <p className="text-3xl font-bold text-primary mb-5">KSh {f[priceKey].toLocaleString()}<span className="text-base font-medium text-slate-500">{priceUnit}</span></p>
            <Button size="lg" className="w-full mb-3">Inquire Now</Button>
            <Button variant="outline" className="w-full"
              href={`https://wa.me/254717506729?text=Hi ${encodeURIComponent(f.name)}, I found you on FitLink Kenya`}>
              💬 WhatsApp
            </Button>
            <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <p className="flex justify-between py-1"><span>Rating</span><span className="font-semibold text-slate-900">{f.rating} ★</span></p>
              <p className="flex justify-between py-1"><span>Reviews</span><span className="font-semibold text-slate-900">{f.reviews}</span></p>
              <p className="flex justify-between py-1"><span>Distance</span><span className="font-semibold text-slate-900">{f.distance}</span></p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
