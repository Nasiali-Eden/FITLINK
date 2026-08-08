import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

export default function ProviderGallery({ provider }) {
  const images = provider.type === "trainer"
    ? [provider.photo].filter(Boolean)
    : [provider.coverImageUrl || provider.photo, ...(provider.galleryImageUrls || provider.photos?.slice(1) || [])].filter(Boolean);
  const [active, setActive] = useState(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const lightboxOpen = active !== null;

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = openerRef.current;
    const inerted = [];
    let activeLayer = dialogRef.current;
    while (activeLayer?.parentElement && activeLayer.parentElement !== document.body) {
      const parent = activeLayer.parentElement;
      Array.from(parent.children).forEach((sibling) => {
        if (sibling !== activeLayer && sibling instanceof HTMLElement) {
          inerted.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      });
      activeLayer = parent;
    }
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus());
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); setActive(null); return; }
      if (event.key === "ArrowLeft") { event.preventDefault(); setActive((value) => (value - 1 + images.length) % images.length); return; }
      if (event.key === "ArrowRight") { event.preventDefault(); setActive((value) => (value + 1) % images.length); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])') || []).filter((element) => !element.closest("[inert]") && element.getClientRects().length);
      if (!focusable.length) { event.preventDefault(); closeRef.current?.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      inerted.forEach(([element, previous]) => { element.inert = previous; });
      window.removeEventListener("keydown", keydown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [lightboxOpen, images.length]);

  if (!images.length) return null;
  const open = (index) => { openerRef.current = document.activeElement; setActive(index); };
  if (provider.type === "trainer") return <GalleryButton image={images[0]} alt={`${provider.name} profile photo`} onClick={() => open(0)} className="aspect-[16/9] w-full" />;

  const visible = images.slice(1, 5);
  const remaining = Math.max(0, images.length - 5);
  return <>
    <section aria-label={`${provider.name} photo gallery`} className={`grid min-w-0 gap-2 overflow-hidden rounded-xl bg-secondary p-2 ${visible.length ? "md:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]" : "grid-cols-1"}`}>
      <GalleryButton image={images[0]} alt={`${provider.name} cover image`} onClick={() => open(0)} className="aspect-video min-h-full w-full" />
      {visible.length > 0 && <div className="flex min-w-0 gap-2 overflow-x-auto md:grid md:grid-cols-2 md:overflow-visible">
        {visible.map((image, index) => <GalleryButton key={image} image={image} alt={`${provider.name} gallery photo ${index + 1}`} onClick={() => open(index + 1)} className="relative aspect-[4/3] min-w-40 flex-1 md:min-w-0" overlay={index === visible.length - 1 && remaining ? `+${remaining}` : ""} />)}
      </div>}
    </section>
    {active !== null && <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${provider.name} image viewer`} className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/95 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
      <button ref={closeRef} type="button" onClick={() => setActive(null)} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-secondary focus-visible:ring-2 focus-visible:ring-accent" aria-label="Close image viewer"><X /></button>
      {images.length > 1 && <button type="button" onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-3 grid size-12 place-items-center rounded-full bg-white/90 text-secondary sm:left-6" aria-label="Previous image"><ChevronLeft /></button>}
      <img src={images[active]} alt={`${provider.name} photo ${active + 1} of ${images.length}`} className="max-h-[86vh] max-w-[88vw] object-contain" />
      {images.length > 1 && <button type="button" onClick={() => setActive((active + 1) % images.length)} className="absolute right-3 grid size-12 place-items-center rounded-full bg-white/90 text-secondary sm:right-6" aria-label="Next image"><ChevronRight /></button>}
      <p className="absolute bottom-4 rounded-md bg-black/55 px-3 py-1 text-sm font-semibold text-white">{active + 1} / {images.length}</p>
    </div>}
  </>;
}

function GalleryButton({ image, alt, onClick, className, overlay }) {
  return <button type="button" onClick={onClick} className={`group relative block overflow-hidden bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}>
    <img src={image} alt={alt} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
    <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-md bg-black/55 text-white opacity-90 shadow-sm transition group-hover:bg-black/75 group-focus-visible:bg-black/75" aria-hidden="true"><Expand size={16} /></span>
    {overlay && <span className="absolute inset-0 grid place-items-center bg-secondary/65 text-2xl font-black text-white">{overlay}</span>}
  </button>;
}
