import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Shield, Star, Trophy, Search, Dumbbell, TrendingUp, Zap, Heart, Users } from "lucide-react";
import { Button, Card } from "../components/Ui.jsx";
import TrainerCard from "../components/TrainerCard.jsx";
import { trainers } from "../data/trainers.js";
import { academies } from "../data/academies.js";
import FacilityCard from "../components/FacilityCard.jsx";

const categories = [
  { icon: Dumbbell, label: "Personal Training", q: "Personal Training" },
  { icon: Trophy, label: "Football", q: "Football" },
  { icon: Shield, label: "Goalkeeping", q: "Football" },
  { icon: TrendingUp, label: "Athletics", q: "Athletics" },
  { icon: Zap, label: "Swimming", q: "Swimming" },
  { icon: Heart, label: "Yoga", q: "Yoga" },
];

const why = [
  { icon: Shield, title: "Only Verified Trainers", body: "All professionals are certified and background-checked" },
  { icon: Users, title: "Compare Prices", body: "Find the best trainer within your budget" },
  { icon: Zap, title: "Easy Booking", body: "Book instantly with our simple booking system" },
  { icon: Star, title: "Real Reviews", body: "Read authentic feedback from real clients" },
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const featured = trainers.slice(0, 3);
  const search = (e) => { e.preventDefault(); navigate(`/find-trainer?q=${encodeURIComponent(q)}`); };

  return (
    <>
      {/* HERO */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Find Trusted Fitness &amp; Sports Trainers Anywhere in Kenya
              </h1>
              <p className="text-lg text-primary-foreground/90 mb-6">Search. Compare. Book. Train.</p>
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2"><Shield size={18} /><span>Verified Trainers</span></div>
                <div className="flex items-center gap-2"><Star size={18} /><span>Certified Coaches</span></div>
                <div className="flex items-center gap-2"><Trophy size={18} /><span>Trusted Gyms</span></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/find-trainer" className="flex-1 sm:flex-none">
                  <Button variant="white" size="lg" className="w-full">Find Trainer</Button>
                </Link>
                <Link to="/join-trainer" className="flex-1 sm:flex-none">
                  <Button variant="outlineWhite" size="lg" className="w-full">Join as Trainer</Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=75"
                alt="Fitness professionals in Kenya"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="bg-slate-50 py-12 border-b border-slate-200">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-900">What are you looking for?</h2>
          <form onSubmit={search} className="max-w-2xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search trainers, gyms, academies, or wellness..."
                className="border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none pl-10 h-12 focus:border-primary"
              />
            </div>
            <Button type="submit" size="xl">Search</Button>
          </form>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link key={c.label} to={`/find-trainer?category=${encodeURIComponent(c.q)}`}>
                <Card className="p-6 text-center transition-all cursor-pointer group hover:shadow-lg hover:border-primary">
                  <c.icon className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-slate-900">{c.label}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TRAINERS */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Featured Trainers</h2>
            <Link to="/find-trainer"><Button variant="outline">View All</Button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((t) => <TrainerCard key={t.id} trainer={t} />)}
          </div>
        </div>
      </section>

      {/* FEATURED SPORTS ACADEMIES */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Sports Academies &amp; Wellness</h2>
            <div className="flex gap-3">
              <Link to="/find-academy"><Button variant="outline">All Academies</Button></Link>
              <Link to="/find-wellness"><Button variant="outline">Wellness Centres</Button></Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {academies.map((a) => (
              <FacilityCard key={a.id} item={a} extra={a.ages}
                listLabel="Programs" listValue={a.programs}
                priceLabel="Registration" priceValue={a.registration} priceUnit="/month"
                viewPath={`/academy/${a.id}`} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">Why Choose FitLink Kenya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {why.map((w) => (
              <Card key={w.title} className="p-6 text-center gap-0 transition-shadow hover:shadow-md">
                <w.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">{w.title}</h3>
                <p className="text-sm text-slate-600">{w.body}</p>
              </Card>
            ))}
          </div>
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-8 md:p-12">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
                <p className="text-sm md:text-base">Verified Trainers</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">150+</div>
                <p className="text-sm md:text-base">Trusted Gyms</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">10K+</div>
                <p className="text-sm md:text-base">Happy Clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Ready to Transform Your Fitness Journey?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of Kenyans who have found their perfect trainer or gym on FitLink Kenya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/find-trainer"><Button size="lg">Find Your Trainer</Button></Link>
            <Link to="/join-trainer"><Button size="lg" variant="outline">Start Earning as a Trainer</Button></Link>
            <Link to="/register-gym"><Button size="lg" variant="outline">Register Your Gym</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
