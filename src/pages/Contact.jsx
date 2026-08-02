import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, Button } from "../components/Ui.jsx";

const contacts = [[Mail, "Email", "support@fitlink.co.ke"], [Phone, "Phone / WhatsApp", "+254 717 506 729"], [MapPin, "Office", "Nairobi, Kenya"]];
const control = "border-input w-full rounded-md border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", category: "General feedback", subject: "", message: "" });
  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  const prepareEmail = (e) => {
    e.preventDefault();
    const subject = `[${form.category}] ${form.subject}`;
    const body = `Name: ${form.name}\nReply email: ${form.email}\nCategory: ${form.category}\n\n${form.message}`;
    window.location.href = `mailto:support@fitlink.co.ke?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return <>
    <section className="relative overflow-hidden bg-gradient-to-r from-secondary via-[#16466E] to-primary text-white py-12">
      <div aria-hidden="true" className="absolute -right-12 -top-40 h-80 w-52 rotate-[22deg] rounded-[48%] border-[2.5rem] border-white/10" />
      <div aria-hidden="true" className="absolute right-20 top-20 h-36 w-24 rotate-[22deg] rounded-[48%] border-[1.25rem] border-accent/20" />
      <div className="container relative"><h1 className="text-4xl font-bold mb-2">Contact Us</h1><p className="text-lg text-white/90">Questions about joining, verification or partnerships? We reply within one business day.</p></div>
    </section>
    <div className="flex-1 container py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-4">{contacts.map(([Icon, label, value]) => <Card key={label} className="p-5 flex-row items-start gap-4"><Icon className="w-6 h-6 text-primary mt-0.5" /><div><p className="text-sm text-slate-600">{label}</p>{label === "Email" ? <a href={`mailto:${value}`} className="font-semibold text-slate-900 hover:text-primary">{value}</a> : <p className="font-semibold text-slate-900">{value}</p>}</div></Card>)}</div>
      <Card className="p-8 lg:col-span-2 gap-0"><form className="space-y-5" onSubmit={prepareEmail}>
        <div><h2 className="text-2xl font-bold text-slate-900 mb-2">Share your feedback</h2><p className="text-sm text-slate-600">Tell us what is working or where Fitlink can improve. Fields marked <span aria-hidden="true">*</span><span className="sr-only"> with an asterisk</span> are required.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name" id="feedback-name"><input id="feedback-name" name="name" value={form.name} onChange={update} required autoComplete="name" className={`${control} h-10`} /></Field>
          <Field label="Reply email" id="feedback-email"><input id="feedback-email" name="email" value={form.email} onChange={update} required type="email" autoComplete="email" className={`${control} h-10`} /></Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Feedback category" id="feedback-category"><select id="feedback-category" name="category" value={form.category} onChange={update} required className={`${control} h-10 bg-white`}><option>General feedback</option><option>Website experience</option><option>Trainer or facility</option><option>Account or registration</option><option>Safety or trust</option></select></Field>
          <Field label="Subject" id="feedback-subject"><input id="feedback-subject" name="subject" value={form.subject} onChange={update} required className={`${control} h-10`} /></Field>
        </div>
        <Field label="Feedback" id="feedback-message"><textarea id="feedback-message" name="message" value={form.message} onChange={update} required rows={6} className={`${control} py-2`} /></Field>
        <div className="rounded-md border border-primary/20 bg-primary-soft p-4"><p id="email-handoff-note" className="text-sm text-secondary">The button below opens your email app with this feedback filled in. Review it there, then send it to finish.</p></div>
        <Button type="submit" size="lg" className="w-full" aria-describedby="email-handoff-note">Open Email App</Button>
      </form></Card>
    </div>
  </>;
}

function Field({ label, id, children }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-secondary">{label} <span aria-hidden="true">*</span></label>{children}</div>;
}
