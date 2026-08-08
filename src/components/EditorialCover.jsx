export default function EditorialCover({ post, compact = false }) {
  const founderEdition = post.slug === "what-is-fitlink";
  if (!founderEdition) return <img src={post.coverImage} alt="" className="h-full w-full object-cover" />;
  return <div className="relative flex h-full min-h-64 overflow-hidden bg-secondary text-white">
    <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:32px_32px]" />
    <img src="/brand/fitlink-symbol.png" alt="" aria-hidden="true" className="absolute -bottom-24 -right-20 w-[70%] max-w-[460px] rotate-[-8deg] opacity-30 mix-blend-screen" />
    <div className={`relative flex w-full flex-col justify-between ${compact ? "p-6" : "p-8 md:p-12"}`}>
      <div className="flex items-start justify-between gap-5"><span className="border-l-4 border-primary-bright pl-3 text-[10px] font-black uppercase tracking-[.23em] text-white">Field note / 001</span><span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">Nairobi · 06.08.26</span></div>
      <div className={compact ? "mt-16" : "mt-28 md:mt-36"}><p className="max-w-md text-lg font-bold leading-snug text-white md:text-2xl">“Fitness access should be easier to trust, easier to find, and practical to use.”</p><div className="mt-5 flex items-center gap-3"><span className="h-px w-10 bg-accent" /><span className="text-xs font-bold uppercase tracking-[.18em] text-slate-300">Dennis Mwambu</span></div></div>
    </div>
  </div>;
}
