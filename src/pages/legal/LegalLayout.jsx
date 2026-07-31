// Shared shell for legal pages — Manus-styled hero + prose content.
export default function LegalLayout({ title, subtitle, children }) {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-lg text-primary-foreground/90">{subtitle}</p>}
        </div>
      </section>
      <div className="flex-1 container py-12">
        <div className="max-w-3xl space-y-8 text-slate-700 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    </>
  );
}
