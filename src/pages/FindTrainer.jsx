import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import TrainerCard from "../components/TrainerCard.jsx";
import { trainerCategories } from "../data/trainers.js";
import { useProviders } from "../hooks/useProviders.js";

export default function FindTrainer() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [cat, setCat] = useState(params.get("category") || "All Trainers");
  const { providers: trainers, loading, error } = useProviders("trainer");

  const results = useMemo(() => {
    let list = trainers;
    if (cat !== "All Trainers") list = list.filter((t) => t.category === cat);
    if (q) list = list.filter((t) =>
      (t.name + t.specialty + t.location).toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [q, cat, trainers]);

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Trainer</h1>
          <p className="text-lg text-primary-foreground/90">{results.length} verified trainers available</p>
        </div>
      </section>

      <div className="flex-1 container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar filters */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 p-6 rounded-lg sticky top-20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter size={18} /> Filters
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2">Search</label>
                <input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Trainer name or sport..."
                  className="border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none h-10 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Category</label>
                <div className="space-y-2">
                  {trainerCategories.map((c) => (
                    <button key={c} onClick={() => setCat(c)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        cat === c ? "bg-primary text-white font-semibold" : "bg-white text-slate-700 hover:bg-slate-100"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? <p className="py-20 text-center text-slate-500">Loading approved trainers…</p> : error ? <p role="alert" className="rounded-lg bg-red-50 p-5 text-red-700">{error}</p> : results.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((t) => <TrainerCard key={t.id} trainer={t} detailed />)}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-600">
                <p className="text-lg font-semibold text-slate-900 mb-2">No trainers found</p>
                <p className="text-sm">Try a different search or category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
