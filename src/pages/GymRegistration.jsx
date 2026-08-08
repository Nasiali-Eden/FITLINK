import { useState } from "react";
import { Upload } from "lucide-react";
import { Card, Button } from "../components/Ui.jsx";
import PaymentModal from "../components/PaymentModal.jsx";
import { gymPlans } from "../data/pricing.js";

const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu (Eldoret)", "Kiambu", "Machakos", "Other"];
const facilityTypes = ["Gym", "Sports Academy", "Wellness Centre"];
const amenities = ["Free Weights", "Cardio Zone", "Pool", "Sauna", "Group Classes", "Personal Training", "Parking", "Showers", "Cafe", "CrossFit"];

const Input = ({ label, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="block text-sm font-semibold text-slate-900 mb-2">{label}</span>
    <input {...props} className="border-input w-full rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
  </label>
);

export default function GymRegistration() {
  const [plan, setPlan] = useState(gymPlans[0]);
  const [pay, setPay] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return (
    <div className="flex-1 container py-24 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">🎉</div>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Facility submitted for verification!</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">Our team will review your details and publish your facility shortly.</p>
      <Button to="/" className="mt-8">Back to Home</Button>
    </div>
  );

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Facility Registration</h1>
          <p className="text-lg text-primary-foreground/90">Register your facility and start receiving inquiries</p>
        </div>
      </section>

      <div className="flex-1 container py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 gap-0 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Facility Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-semibold text-slate-900 mb-2">Facility Type</span>
              <select className="border-input w-full rounded-md border bg-white px-3 h-10 text-sm outline-none focus:border-primary">
                {facilityTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <Input label="Facility Name" placeholder="e.g. Elite Fitness Nairobi" />
            <Input label="Owner / Manager Name" />
            <Input label="Phone Number" placeholder="07XX XXX XXX" />
            <Input label="Email" type="email" />
            <label className="block">
              <span className="block text-sm font-semibold text-slate-900 mb-2">County</span>
              <select className="border-input w-full rounded-md border bg-white px-3 h-10 text-sm outline-none focus:border-primary">
                <option value="">Select…</option>
                {counties.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <Input label="Town / Area" placeholder="e.g. Westlands" />
            <Input label="Google Maps Link" placeholder="Paste map URL" className="md:col-span-2" />
            <Input label="Opening Hours" placeholder="e.g. Mon–Sun 5AM–10PM" />
            <Input label="Membership From (KSh/month)" type="number" placeholder="e.g. 3500" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">Services &amp; Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <label key={a} className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm hover:border-primary transition-colors">
                <input type="checkbox" className="accent-primary" /> {a}
              </label>
            ))}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">Photos</h3>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 p-8 text-center hover:border-primary transition-colors">
            <Upload className="text-primary" size={24} />
            <span className="text-sm font-semibold text-slate-900">Upload facility photos</span>
            <span className="text-xs text-slate-400">JPG or PNG, up to 10 images</span>
            <input type="file" multiple className="hidden" />
          </label>
        </Card>

        <div>
          <Card className="p-6 gap-0 sticky top-20">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Choose a Plan</h3>
            <div className="space-y-3 mb-5">
              {gymPlans.map((p) => (
                <button key={p.id} onClick={() => setPlan(p)} type="button"
                  className={`w-full rounded-xl border p-4 text-left transition ${plan.id === p.id ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-slate-200 hover:border-primary/50"}`}>
                  <p className="flex items-center justify-between font-bold text-slate-900">{p.name}
                    <span className="text-primary">KSh {p.price.toLocaleString()}<span className="text-xs font-medium text-slate-500">/mo</span></span>
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{p.tagline}</p>
                </button>
              ))}
            </div>
            <Button size="lg" className="w-full" onClick={() => setPay(true)}>Pay &amp; Submit Facility</Button>
            <p className="mt-3 text-center text-xs text-slate-400">Your facility goes live after verification.</p>
          </Card>
        </div>
      </div>

      <PaymentModal open={pay} onClose={() => setPay(false)} onSuccess={() => setSubmitted(true)}
        title={`Subscribe · ${plan.name}`} amount={plan.price} purpose="gym subscription" />
    </>
  );
}
