import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import FacilityCard from "../components/FacilityCard.jsx";
import { wellnessCentres } from "../data/wellness.js";
import { Button } from "../components/Ui.jsx";

export default function FindWellness() {
  const [q, setQ] = useState("");
  const results = useMemo(() =>
    q ? wellnessCentres.filter((w) => (w.name + w.location + w.services).toLowerCase().includes(q.toLowerCase())) : wellnessCentres,
  [q]);

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Find a Wellness Centre</h1>
          <p className="text-lg text-primary-foreground/90">{results.length} trusted wellness centres — physiotherapy, nutrition, recovery & more</p>
        </div>
      </section>

      <section className="bg-slate-50 py-8 border-b border-slate-200">
        <div className="container">
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search wellness centres by name, service, or location..."
                className="border-input w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-xs outline-none pl-10 h-12 focus:border-primary" />
            </div>
            <Button size="xl">Search</Button>
          </div>
        </div>
      </section>

      <div className="flex-1 container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((w) => (
            <FacilityCard key={w.id} item={w}
              listLabel="Services" listValue={w.services}
              priceLabel="Sessions from" priceValue={w.sessionFrom} priceUnit="/session"
              viewPath={`/wellness/${w.id}`} />
          ))}
        </div>
      </div>
    </>
  );
}
