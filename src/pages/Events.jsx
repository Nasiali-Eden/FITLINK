import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard.jsx";
import { EventGridSkeleton } from "../components/LoadingSkeletons.jsx";
import { getEvents } from "../lib/content.js";

export default function Events() {
  const [events, setEvents] = useState(undefined);
  const [source, setSource] = useState("local");
  const [deliveryError, setDeliveryError] = useState(false);

  useEffect(() => {
    let active = true;
    getEvents().then((result) => {
      if (active) {
        setEvents(result.items);
        setSource(result.source);
        setDeliveryError(Boolean(result.error));
      }
    });
    return () => { active = false; };
  }, []);

  return (
    <>
      <section className="border-b border-slate-200 bg-secondary-soft py-14 md:py-20">
        <div className="container">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-primary"><Sparkles size={16} />Move together</div>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-secondary md:text-6xl">Fitness events across Kenya.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Discover workouts, competitions, workshops, wellness gatherings, and community meet-ups published by FitLink.</p>
        </div>
      </section>
      <section className="container py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-wider text-primary">Calendar</p><h2 className="mt-1 text-2xl font-black text-secondary">Upcoming events</h2></div>
          <span className="text-xs text-slate-600">{source === "cms" ? "Live CMS calendar" : deliveryError ? "Showing the local FitLink calendar" : "FitLink event calendar"}</span>
        </div>
        {events === undefined ? <EventGridSkeleton /> : events.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>
        ) : <EmptyEvents />}
      </section>
    </>
  );
}

function EmptyEvents() {
  return (
    <div className="relative overflow-hidden border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <div className="absolute left-0 top-0 h-full w-2 bg-primary" />
      <CalendarDays size={48} className="mx-auto text-primary" />
      <h2 className="mt-5 text-2xl font-black text-secondary">No upcoming events yet</h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">Check back soon for new FitLink workouts, workshops, and community sessions.</p>
      <Link to="/blog" className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:underline focus-visible:underline">Read the FitLink journal <ArrowRight size={16} /></Link>
    </div>
  );
}
