import { useParams, Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getGym, gyms } from "../data/gyms.js";
import { Card, Button, Stars } from "../components/Ui.jsx";
import GymCard from "../components/GymCard.jsx";

export default function GymProfile() {
  const { id } = useParams();
  const g = getGym(id);

  if (!g) return (
    <div className="flex-1 container py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Gym not found</h1>
      <Button to="/find-gym" className="mt-6">Browse Gyms</Button>
    </div>
  );

  const others = gyms.filter((x) => x.id !== g.id);

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <p className="text-sm text-primary-foreground/80 mb-2">
            <Link to="/find-gym" className="hover:underline">Find Gym</Link> / {g.name}
          </p>
          <h1 className="text-4xl font-bold">{g.name}</h1>
          <p className="text-lg text-primary-foreground/90 mt-1 flex items-center gap-2"><MapPin size={16} /> {g.location}</p>
        </div>
      </section>

      <div className="flex-1 container py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="py-0 gap-0 overflow-hidden">
            <div className="relative h-72 bg-slate-200 overflow-hidden">
              <img src={g.photo} alt={g.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-1 mb-4">
                <Stars rating={g.rating} />
                <span className="text-sm font-semibold text-slate-900">{g.rating}</span>
                <span className="text-xs text-slate-600">({g.reviews} reviews)</span>
              </div>
              <div className="mb-6">
                <p className="text-xs text-slate-600 font-semibold mb-1">Services</p>
                <p className="text-slate-700">{g.services}</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 h-48 flex items-center justify-center text-primary font-semibold">
                🗺️ Map preview — {g.location}
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 gap-0 sticky top-20">
            <p className="text-xs text-slate-600 font-semibold mb-1">Membership</p>
            <p className="text-3xl font-bold text-primary mb-5">KSh {g.membership.toLocaleString()}<span className="text-base font-medium text-slate-500">/month</span></p>
            <Button size="lg" className="w-full mb-3">Inquire About Membership</Button>
            <Button variant="outline" className="w-full"
              href={`https://wa.me/254700000000?text=Hi ${encodeURIComponent(g.name)}, I found you on FitLink Kenya`}>
              💬 WhatsApp the Gym
            </Button>
            <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <p className="flex justify-between py-1"><span>Rating</span><span className="font-semibold text-slate-900">{g.rating} ★</span></p>
              <p className="flex justify-between py-1"><span>Reviews</span><span className="font-semibold text-slate-900">{g.reviews}</span></p>
              <p className="flex justify-between py-1"><span>Distance</span><span className="font-semibold text-slate-900">{g.distance}</span></p>
            </div>
          </Card>
        </div>
      </div>

      {others.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">More Gyms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {others.map((s) => <GymCard key={s.id} gym={s} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
