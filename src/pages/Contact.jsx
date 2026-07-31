import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, Button } from "../components/Ui.jsx";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-lg text-primary-foreground/90">Questions about joining, verification or partnerships? We reply within one business day.</p>
        </div>
      </section>

      <div className="flex-1 container py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          {[[Mail, "Email", "dennismwanzia@gmail.com"], [Phone, "Phone / WhatsApp", "+254 717 506 729"], [MapPin, "Office", "Nairobi, Kenya"]].map(([Icon, k, v]) => (
            <Card key={k} className="p-5 flex-row items-start gap-4">
              <Icon className="w-6 h-6 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-slate-600">{k}</p>
                <p className="font-semibold text-slate-900">{v}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8 lg:col-span-2 gap-0">
          {sent ? (
            <div className="text-center py-16">
              <p className="text-2xl mb-2">✓</p>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Message sent</h3>
              <p className="text-sm text-slate-600">Thanks for reaching out — we'll be in touch soon.</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Send us a message</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Name" className="border-input rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
                <input required type="email" placeholder="Email" className="border-input rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
              </div>
              <input placeholder="Subject" className="border-input w-full rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
              <textarea required rows={5} placeholder="How can we help?" className="border-input w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary" />
              <Button type="submit" size="lg" className="w-full">Send Message</Button>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}
