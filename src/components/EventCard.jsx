import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { eventDate } from "../lib/contentFormat.js";
import { selectEventImage } from "../lib/content.js";
import { Card } from "./Ui.jsx";

export function EventVisual({ event, className = "", eager = false }) {
  const visual = selectEventImage(event);

  if (!visual.src) {
    return (
      <div className={`grid aspect-video place-items-center bg-secondary-soft ${className}`} aria-hidden="true">
        <CalendarDays size={44} className="text-primary/50" />
      </div>
    );
  }

  const image = (
    <img
      src={visual.src}
      alt={visual.type === "poster" ? `${event.title} event poster` : event.title}
      loading={eager ? "eager" : "lazy"}
      className={visual.type === "poster"
        ? "h-full w-full object-contain"
        : "h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"}
    />
  );

  if (visual.type === "poster") {
    return (
      <a
        href={visual.src}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open the full ${event.title} poster in a new tab`}
        className={`group/poster block aspect-[902/1280] overflow-hidden bg-[#07192b] outline-none focus-visible:ring-2 focus-visible:ring-primary-bright focus-visible:ring-offset-2 ${className}`}
      >
        {image}
      </a>
    );
  }

  return <div className={`group aspect-video overflow-hidden bg-secondary-soft ${className}`}>{image}</div>;
}

export default function EventCard({ event }) {
  return (
    <Card className="group gap-0 overflow-hidden border-slate-200 transition-shadow hover:shadow-xl">
      <EventVisual event={event} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-primary">{eventDate(event.startsAt)}</p>
          <span className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${event.cancelled ? "bg-red-600 text-white" : "bg-primary-soft text-primary"}`}>
            {event.cancelled ? "Cancelled" : event.category}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-black leading-tight text-secondary">
          <Link to={`/events/${event.slug}`} className="outline-none hover:text-primary focus-visible:underline">{event.title}</Link>
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{event.excerpt}</p>
        <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
          <span>{event.venueName}, {event.town}, {event.county}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <strong className="text-sm text-secondary">{event.priceKes === 0 ? "Free" : `KSh ${event.priceKes.toLocaleString()}`}</strong>
          <Link to={`/events/${event.slug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline focus-visible:underline">
            Event details <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
