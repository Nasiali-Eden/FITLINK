import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Shield, Star, Trophy, Search, Dumbbell, TrendingUp, Zap, Heart, Users } from "lucide-react";
import { Button, Card } from "../components/Ui.jsx";
import TrainerCard from "../components/TrainerCard.jsx";
import GymCard from "../components/GymCard.jsx";
import FacilityCard from "../components/FacilityCard.jsx";
import { EventVisual } from "../components/EventCard.jsx";
import { EventFeatureSkeleton, ProviderGridSkeleton } from "../components/LoadingSkeletons.jsx";
import { useProviders } from "../hooks/useProviders.js";
import { getEvents } from "../lib/content.js";
import { eventDate } from "../lib/contentFormat.js";

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
  const { providers: trainers, loading: trainersLoading } = useProviders("trainer");
  const { providers: gyms, loading: gymsLoading, error: gymsError } = useProviders("gym");
  const { providers: academies, loading: academiesLoading } = useProviders("academy");
  const [events, setEvents] = useState(undefined);
  const featured = trainers.filter((trainer) => trainer.featured).concat(trainers.filter((trainer) => !trainer.featured)).slice(0, 3);
  const search = (e) => { e.preventDefault(); navigate(`/find-trainer?q=${encodeURIComponent(q)}`); };

  useEffect(() => {
    let active = true;
    getEvents().then((result) => { if (active) setEvents(result.items); });
    return () => { active = false; };
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-[#16466E] to-primary text-white py-16 md:py-24">
        <div aria-hidden="true" className="absolute -right-24 -top-40 h-[36rem] w-[24rem] rotate-[22deg] rounded-[50%] border-[4rem] border-white/7" />
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
                  <Button size="lg" className="w-full">Find Trainer</Button>
                </Link>
                <Link to="/join-trainer" className="flex-1 sm:flex-none">
                  <Button variant="outlineWhite" size="lg" className="w-full">Join as Trainer</Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:flex justify-center">
              <img
                src="/brand/fitlink-symbol.png"
                alt=""
                aria-hidden="true"
                className="w-full max-w-md rounded-[2rem] bg-white/95 p-10 shadow-2xl shadow-secondary/30"
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
          <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="text-3xl font-bold text-slate-900">Featured Trainers</h2>
            <Link to="/find-trainer"><Button variant="outline">View All</Button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trainersLoading ? <ProviderGridSkeleton label="Loading approved trainers" /> : featured.length ? featured.map((t) => <TrainerCard key={t.id} trainer={t} />) : <p className="md:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Approved trainers will appear here after FitLink verification.</p>}
          </div>
        </div>
      </section>

      {/* FEATURED GYMS */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-slate-900">Featured Gyms</h2>
              <p className="mt-2 text-sm font-medium text-slate-600">Trusted fitness facilities, verified by FitLink</p>
            </div>
            <Button to="/find-gym" variant="outline">View All Gyms</Button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gymsLoading ? (
              <ProviderGridSkeleton label="Loading approved gyms" />
            ) : gymsError ? (
              <p role="alert" className="rounded-lg bg-red-50 p-5 text-red-700 md:col-span-2 lg:col-span-3">{gymsError}</p>
            ) : gyms.length ? (
              gyms.slice(0, 3).map((gym) => <GymCard key={gym.id} gym={gym} />)
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 md:col-span-2 lg:col-span-3">
                Approved gyms will appear here after FitLink verification.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED SPORTS ACADEMIES */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <div className="mb-12 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Sports Academies &amp; Wellness</h2>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
              <Link to="/find-academy"><Button variant="outline">All Academies</Button></Link>
              <Link to="/find-wellness"><Button variant="outline">Wellness Centres</Button></Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {academiesLoading ? <ProviderGridSkeleton label="Loading approved academies" /> : academies.length ? academies.slice(0, 3).map((a) => (
              <FacilityCard key={a.id} item={a} extra={a.ages}
                listLabel="Programs" listValue={a.programs}
                priceLabel="Registration" priceValue={a.registration} priceUnit="/month"
                viewPath={`/academy/${a.id}`} />
            )) : <p className="md:col-span-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">Approved academies will appear here after FitLink verification.</p>}
          </div>
        </div>
      </section>

      <HomeEvents events={events} />

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
            <Link to="/register-facility"><Button size="lg" variant="outline">Register Your Facility</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}

function HomeEvents({ events }) {
  if (events === undefined) return <EventFeatureSkeleton />;
  if (!events.length) return null;

  const event = events.find((item) => item.featured) || events[0];
  return (
    <section className="relative overflow-hidden bg-secondary py-16 text-white md:py-20" data-home-events>
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(0,198,122,.18),transparent_65%)]" />
      <div className="container relative grid gap-10 lg:grid-cols-[minmax(300px,440px)_1fr] lg:items-center lg:gap-16">
        <EventVisual event={event} eager className="mx-auto w-full max-w-[440px] border border-white/10 shadow-2xl shadow-black/30" />
        <div>
          <p className="text-xs font-black uppercase tracking-[.24em] text-primary-bright">Upcoming at FitLink</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight md:text-5xl">{event.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">{event.excerpt}</p>
          <dl className="mt-7 grid gap-4 text-sm text-slate-200 sm:grid-cols-2">
            <div className="flex gap-3"><CalendarDays className="mt-0.5 shrink-0 text-primary-bright" size={20} /><div><dt className="font-bold text-white">Date and time</dt><dd className="mt-1">{eventDate(event.startsAt)}</dd></div></div>
            <div className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-primary-bright" size={20} /><div><dt className="font-bold text-white">Venue</dt><dd className="mt-1">{event.venueName}, {event.town}</dd></div></div>
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button to={`/events/${event.slug}`} variant="white" size="lg">View event details <ArrowRight size={17} /></Button>
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-primary-bright decoration-2 underline-offset-4 hover:text-primary-bright focus-visible:text-primary-bright">See all events</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
