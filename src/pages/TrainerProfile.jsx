import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, MapPin } from "lucide-react";
import { getTrainer, trainers } from "../data/trainers.js";
import { Card, Button, Stars } from "../components/Ui.jsx";
import TrainerCard from "../components/TrainerCard.jsx";
import PaymentModal from "../components/PaymentModal.jsx";

const reviews = [
  { text: "Professional, punctual and knows how to push you safely. Highly recommend.", stars: 5 },
  { text: "Great programming and always available for questions. Real results.", stars: 5 },
  { text: "Friendly and motivating — sessions fly by and I've never been fitter.", stars: 4 },
];

export default function TrainerProfile() {
  const { id } = useParams();
  const t = getTrainer(id);
  const [pay, setPay] = useState(false);

  if (!t) return (
    <div className="flex-1 container py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Trainer not found</h1>
      <Button to="/find-trainer" className="mt-6">Browse Trainers</Button>
    </div>
  );

  const similar = trainers.filter((x) => x.category === t.category && x.id !== t.id).slice(0, 3);

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <p className="text-sm text-primary-foreground/80 mb-2">
            <Link to="/find-trainer" className="hover:underline">Find Trainer</Link> / {t.name}
          </p>
          <h1 className="text-4xl font-bold">{t.name}</h1>
          <p className="text-lg text-primary-foreground/90 mt-1">{t.specialty}</p>
        </div>
      </section>

      <div className="flex-1 container py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="py-0 gap-0 overflow-hidden">
            <div className="relative h-72 bg-slate-200 overflow-hidden">
              <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
              {t.verified && (
                <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                  <Shield size={12} /> Verified
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-1 mb-4">
                <Stars rating={t.rating} />
                <span className="text-sm font-semibold text-slate-900">{t.rating}</span>
                <span className="text-xs text-slate-600">({t.reviews} reviews)</span>
              </div>
              <p className="text-slate-700 mb-6">{t.bio}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="font-bold text-slate-900">{t.location}</p>
                  <p className="text-xs text-slate-600 mt-1 flex items-center justify-center gap-1"><MapPin size={12} /> Location</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="font-bold text-slate-900">{t.distance}</p>
                  <p className="text-xs text-slate-600 mt-1">Distance</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="font-bold text-primary">KSh {t.price.toLocaleString()}/hr</p>
                  <p className="text-xs text-slate-600 mt-1">Rate</p>
                </div>
              </div>
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Client Reviews</h2>
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <Card key={i} className="p-5 gap-0">
                  <Stars rating={r.stars} />
                  <p className="mt-2 text-slate-700">"{r.text}"</p>
                  <p className="mt-2 text-xs text-slate-500">Verified client</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card className="p-6 gap-0 sticky top-20">
            <p className="text-sm text-slate-500">Session rate</p>
            <p className="text-3xl font-bold text-primary mb-5">KSh {t.price.toLocaleString()}<span className="text-base font-medium text-slate-500">/hr</span></p>
            <label className="block mb-3">
              <span className="block text-sm font-semibold text-slate-900 mb-2">Date</span>
              <input type="date" className="border-input w-full rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
            </label>
            <label className="block mb-5">
              <span className="block text-sm font-semibold text-slate-900 mb-2">Session Type</span>
              <select className="border-input w-full rounded-md border bg-white px-3 h-10 text-sm outline-none focus:border-primary">
                <option>1-on-1 in person</option>
                <option>Online session</option>
                <option>Group session</option>
              </select>
            </label>
            <Button size="lg" className="w-full mb-3" onClick={() => setPay(true)}>Book Now</Button>
            <Button variant="outline" className="w-full"
              href={`https://wa.me/254700000000?text=Hi ${encodeURIComponent(t.name)}, I found you on FitLink Kenya`}>
              💬 Message on WhatsApp
            </Button>
            <p className="mt-4 text-center text-xs text-slate-400">Secure payment held until your session is completed.</p>
          </Card>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Similar Trainers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similar.map((s) => <TrainerCard key={s.id} trainer={s} />)}
            </div>
          </div>
        </section>
      )}

      <PaymentModal open={pay} onClose={() => setPay(false)}
        title={`Book ${t.name}`} amount={t.price} purpose="session booking" />
    </>
  );
}
