import { useState } from "react";
import { Check, Upload } from "lucide-react";
import { Card, Button } from "../components/Ui.jsx";
import PaymentModal from "../components/PaymentModal.jsx";
import { trainerPlans } from "../data/pricing.js";

const stepList = ["Personal Details", "Professional Details", "Documents", "Choose Plan", "Payment"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu (Eldoret)", "Kiambu", "Machakos", "Other"];
const specialties = ["Personal Training", "Football", "Athletics", "Yoga", "Swimming", "Martial Arts", "Nutrition", "Other"];

const Input = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-slate-900 mb-2">{label}</span>
    <input {...props} className="border-input w-full rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
  </label>
);
const Select = ({ label, options }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-slate-900 mb-2">{label}</span>
    <select className="border-input w-full rounded-md border bg-white px-3 h-10 text-sm outline-none focus:border-primary">
      <option value="">Select…</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </label>
);

export default function TrainerRegistration() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(trainerPlans[1]);
  const [pay, setPay] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return (
    <div className="flex-1 container py-24 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">🎉</div>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Application submitted!</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">Our team will verify your documents and your profile will go live shortly.</p>
      <Button to="/" className="mt-8">Back to Home</Button>
    </div>
  );

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Trainer Registration</h1>
          <p className="text-lg text-primary-foreground/90">Create your verified profile and start receiving bookings</p>
        </div>
      </section>

      <div className="flex-1 container py-12">
        {/* Stepper */}
        <div className="flex gap-2 mb-10 overflow-x-auto">
          {stepList.map((label, i) => (
            <div key={label} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap ${
              i === step ? "bg-primary text-white font-semibold" : i < step ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {i < step ? <Check size={12} /> : i + 1}
              </span>
              {label}
            </div>
          ))}
        </div>

        <Card className="p-8 gap-0 max-w-3xl">
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="e.g. James Kipchoge" />
              <Input label="Phone Number" placeholder="07XX XXX XXX" />
              <Input label="Email" type="email" placeholder="you@email.com" />
              <Select label="County" options={counties} />
              <Input label="Town / Area" placeholder="e.g. Westlands" />
            </div>
          )}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Main Specialty" options={specialties} />
              <Input label="Years of Experience" type="number" placeholder="e.g. 6" />
              <Input label="Certifications" placeholder="e.g. NASM, REPs" />
              <Input label="Rate per Hour (KSh)" type="number" placeholder="e.g. 2500" />
              <Input label="Languages" placeholder="e.g. English, Swahili" />
              <Input label="Availability" placeholder="e.g. Mon–Sat, mornings" />
              <label className="block md:col-span-2">
                <span className="block text-sm font-semibold text-slate-900 mb-2">Short Bio</span>
                <textarea rows={4} placeholder="Tell clients how you help them reach their goals…"
                  className="border-input w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Profile Photo", "Certificates", "KRA PIN Certificate", "Intro Video (optional)"].map((d) => (
                <label key={d} className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-6 text-center hover:border-primary transition-colors">
                  <Upload className="text-primary" size={22} />
                  <span className="text-sm font-semibold text-slate-900">{d}</span>
                  <span className="text-xs text-slate-400">Click to upload</span>
                  <input type="file" className="hidden" />
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trainerPlans.map((p) => (
                <button key={p.id} onClick={() => setPlan(p)}
                  className={`rounded-xl border p-5 text-left transition ${plan.id === p.id ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-slate-200 hover:border-primary/50"}`}>
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <p className="mt-1 text-2xl font-bold text-primary">KSh {p.price.toLocaleString()}<span className="text-sm font-medium text-slate-500">/mo</span></p>
                  <p className="mt-2 text-xs text-slate-600">{p.tagline}</p>
                </button>
              ))}
            </div>
          )}
          {step === 4 && (
            <div>
              <div className="rounded-lg bg-slate-50 p-5 mb-6">
                <p className="flex justify-between py-1.5 text-sm"><span className="text-slate-600">Plan</span><span className="font-semibold text-slate-900">{plan.name}</span></p>
                <p className="flex justify-between py-1.5 text-sm"><span className="text-slate-600">Billing</span><span className="font-semibold text-slate-900">Monthly</span></p>
                <p className="mt-2 flex justify-between border-t border-slate-200 pt-3"><span className="font-semibold text-slate-900">Total today</span><span className="font-bold text-primary">KSh {plan.price.toLocaleString()}</span></p>
              </div>
              <ol className="space-y-2 text-sm text-slate-600 mb-6">
                {["Pay subscription", "Admin verification", "Verified badge", "Profile published", "Start receiving bookings"].map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
              <Button size="lg" className="w-full" onClick={() => setPay(true)}>Pay KSh {plan.price.toLocaleString()} &amp; Submit</Button>
            </div>
          )}

          {step < 4 && (
            <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(s - 1, 0))} className={step === 0 ? "invisible" : ""}>← Back</Button>
              <Button onClick={() => setStep((s) => Math.min(s + 1, 4))}>Continue →</Button>
            </div>
          )}
        </Card>
      </div>

      <PaymentModal open={pay} onClose={() => setPay(false)} onSuccess={() => setSubmitted(true)}
        title={`Subscribe · ${plan.name}`} amount={plan.price} purpose="subscription" />
    </>
  );
}
