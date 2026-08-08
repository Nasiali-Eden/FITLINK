function ScreenReaderLoading({ label }) {
  return <span className="sr-only" role="status">{label}</span>;
}

export function ProviderGridSkeleton({ label = "Loading providers", count = 3 }) {
  return (
    <>
      <ScreenReaderLoading label={label} />
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm motion-reduce:animate-none">
          <div className="h-48 bg-slate-200" />
          <div className="space-y-4 p-5">
            <div className="h-5 w-3/5 bg-slate-200" />
            <div className="h-3 w-2/5 bg-slate-100" />
            <div className="flex gap-2"><div className="h-3 w-24 bg-slate-200" /><div className="h-3 w-8 bg-slate-100" /></div>
            <div className="h-3 w-4/5 bg-slate-100" />
            <div className="h-10 bg-slate-200" />
          </div>
        </div>
      ))}
    </>
  );
}

export function EventGridSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ScreenReaderLoading label="Loading events" />
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white motion-reduce:animate-none">
          <div className="aspect-[902/1280] bg-slate-200" />
          <div className="space-y-4 p-5"><div className="h-3 w-2/5 bg-slate-200" /><div className="h-7 w-4/5 bg-slate-200" /><div className="h-16 bg-slate-100" /><div className="h-3 w-3/5 bg-slate-200" /></div>
        </div>
      ))}
    </div>
  );
}

export function EventFeatureSkeleton() {
  return (
    <section aria-label="Loading upcoming events" className="bg-secondary py-16 text-white">
      <ScreenReaderLoading label="Loading upcoming events" />
      <div className="container grid animate-pulse gap-8 motion-reduce:animate-none lg:grid-cols-[minmax(300px,440px)_1fr] lg:items-center">
        <div aria-hidden="true" className="mx-auto aspect-[902/1280] w-full max-w-[440px] bg-white/10" />
        <div aria-hidden="true" className="space-y-6"><div className="h-3 w-28 bg-white/15" /><div className="h-12 w-4/5 bg-white/15" /><div className="h-20 bg-white/10" /><div className="h-4 w-3/5 bg-white/15" /><div className="h-11 w-40 bg-white/15" /></div>
      </div>
    </section>
  );
}

export function EventDetailSkeleton() {
  return (
    <div aria-label="Loading event details" className="container py-12">
      <ScreenReaderLoading label="Loading event details" />
      <div aria-hidden="true" className="grid animate-pulse gap-10 motion-reduce:animate-none lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="mx-auto aspect-[902/1280] w-full max-w-2xl bg-slate-200" />
        <div className="h-96 bg-slate-100" />
      </div>
    </div>
  );
}
