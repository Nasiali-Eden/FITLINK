import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, MapPin, Phone, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { EventVisual } from "../components/EventCard.jsx";
import { EventDetailSkeleton } from "../components/LoadingSkeletons.jsx";
import { Button } from "../components/Ui.jsx";
import { getEvent, selectEventImage } from "../lib/content.js";
import { eventDate } from "../lib/contentFormat.js";

export default function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(undefined);

  useEffect(() => {
    let active = true;
    getEvent(slug).then((result) => { if (active) setEvent(result.item); });
    return () => { active = false; };
  }, [slug]);
  useEffect(() => {
    document.title = event ? `${event.title} | FitLink Events` : event === null ? "Event not found | FitLink" : "FitLink Events";
    return () => { document.title = "FitLink Kenya"; };
  }, [event]);

  if (event === undefined) return <EventDetailSkeleton />;
  if (!event) return (
    <section className="container py-16 md:py-24">
      <div className="relative mx-auto max-w-2xl overflow-hidden border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center md:px-12">
        <div className="absolute inset-y-0 left-0 w-2 bg-primary-bright" />
        <span className="mx-auto grid size-16 place-items-center rounded-xl bg-primary-soft text-primary"><CalendarDays size={32} /></span>
        <p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-primary">FitLink events</p>
        <h1 className="mt-2 text-3xl font-black text-secondary">This event is not available</h1>
        <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">It may have been unpublished, removed, or the address may be incorrect. Browse the calendar for current FitLink events.</p>
        <Button to="/events" variant="primary" size="lg" className="mt-7">View all events</Button>
      </div>
    </section>
  );

  const deadlinePassed = event.registrationDeadline && Date.now() > new Date(event.registrationDeadline).getTime();
  const registrationOpen = event.registrationUrl && !event.cancelled && !deadlinePassed;
  const isPoster = selectEventImage(event).type === "poster";

  return (
    <div>
      <section className="bg-secondary py-12 text-white">
        <div className="container">
          <Link to="/events" className="text-sm font-bold text-slate-300 hover:text-white focus-visible:underline">← All events</Link>
          <p className="mt-8 text-xs font-black uppercase tracking-[.2em] text-primary-bright">{event.category}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black md:text-6xl">{event.title}</h1>
          {event.cancelled && <p className="mt-5 inline-block bg-red-600 px-4 py-2 font-bold">This event has been cancelled</p>}
        </div>
      </section>
      <div className="container grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-14">
        <article>
          <EventVisual event={event} eager className={isPoster ? "mx-auto w-full max-w-[720px] shadow-2xl shadow-secondary/20" : "w-full"} />
          {isPoster && <p className="mt-3 text-center text-xs font-medium text-slate-500">Tap the poster to open the full-size artwork.</p>}
          <div className="mt-9 space-y-6 text-base leading-8 text-slate-700">
            {event.description.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {event.activities?.length > 0 && (
            <section className="mt-10 border-l-4 border-primary bg-primary-soft p-6">
              <h2 className="text-xl font-black text-secondary">Activities</h2>
              <ul className="mt-4 flex flex-wrap gap-2">{event.activities.map((activity) => <li key={activity} className="bg-white px-3 py-2 text-sm font-bold text-secondary shadow-sm">{activity}</li>)}</ul>
            </section>
          )}
          {event.pricingOptions?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-black text-secondary">Pricing options</h2>
              <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">{event.pricingOptions.map((price) => <li key={price} className="py-4 font-semibold text-slate-700">{price}</li>)}</ul>
            </section>
          )}
          {event.gallery.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-black text-secondary">Event gallery</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">{event.gallery.map((image, index) => <a key={image} href={image} target="_blank" rel="noreferrer"><img src={image} alt={`${event.title} gallery ${index + 1}`} className="aspect-[4/3] w-full object-cover" /></a>)}</div>
            </section>
          )}
        </article>
        <aside className="h-fit border-t-4 border-primary-bright bg-secondary-soft p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-black text-secondary">Event details</h2>
          <dl className="mt-5 space-y-5 text-sm">
            <Detail icon={<CalendarDays />} label="Starts" value={eventDate(event.startsAt)} />
            {event.endsAt && <Detail icon={<CalendarDays />} label="Ends" value={eventDate(event.endsAt)} />}
            <Detail icon={<MapPin />} label="Venue" value={[event.venueName, event.address, event.town, event.county].filter(Boolean).join(", ")} />
            <Detail icon={<Users />} label="Organiser" value={event.organizerName} />
            {event.organizerContact && <Detail icon={<Phone />} label="Contact / payment" value={event.organizerContact} />}
          </dl>
          <p className="mt-6 border-t pt-5 text-2xl font-black text-secondary">{event.priceKes === 0 ? "Free" : `KSh ${event.priceKes.toLocaleString()}`}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Regular price</p>
          {registrationOpen ? (
            <Button href={event.registrationUrl} target="_blank" rel="noreferrer" variant="primary" size="lg" className="mt-5 w-full">Register <ExternalLink size={16} /></Button>
          ) : event.registrationNote && !event.cancelled && !deadlinePassed ? (
            <div className="mt-5 border border-primary/20 bg-white p-4 text-sm leading-6 text-slate-700"><strong className="block text-secondary">Reserve your place</strong>{event.registrationNote}</div>
          ) : (
            <Button disabled variant="primary" size="lg" className="mt-5 w-full">{event.cancelled ? "Registration closed" : deadlinePassed ? "Registration deadline passed" : "Registration details coming soon"}</Button>
          )}
          {event.registrationDeadline && !deadlinePassed && <p className="mt-3 text-xs leading-5 text-slate-600">Registration closes {eventDate(event.registrationDeadline)}.</p>}
          {event.mapUrl && <a href={event.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">Open map <ExternalLink size={14} /></a>}
          <p className="mt-5 text-xs leading-5 text-slate-600">Times shown in {event.timezone}.</p>
        </aside>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return <div className="flex gap-3"><span className="mt-0.5 text-primary [&>svg]:size-5">{icon}</span><div><dt className="font-bold text-secondary">{label}</dt><dd className="mt-0.5 leading-5 text-slate-600">{value}</dd></div></div>;
}
