import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Card, Button } from "../components/Ui.jsx";
import { trainerPlans, gymPlans, trainerIncluded, gymIncluded } from "../data/pricing.js";

function PlanCard({ plan, registrationPath }) {
  return (
    <Card className={`p-8 flex flex-col gap-0 ${plan.popular ? "ring-2 ring-primary shadow-lg md:scale-105" : ""}`}>
      {plan.popular && (
        <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 w-fit">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
      <p className="text-sm text-slate-600 mb-4">{plan.tagline}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-primary">KSh {plan.price.toLocaleString()}</span>
        <span className="text-slate-600">/month</span>
      </div>
      <Button to={`${registrationPath}?plan=${plan.id}`} className="w-full mb-6" variant={plan.popular ? "default" : "secondary"}>
        {plan.cta}
      </Button>
      <div className="space-y-3 flex-1">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-3">
            <Check size={16} className="text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-slate-700">{f}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Included({ items, title = "Member plans include:" }) {
  return (
    <div className="mt-10">
      <h3 className="font-bold text-lg text-slate-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
        {items.map((i) => <p key={i}>✓ {i}</p>)}
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-lg text-primary-foreground/90">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      <div className="flex-1 container py-16">
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">For Trainers &amp; Coaches</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {trainerPlans.map((p) => <PlanCard key={p.id} plan={p} registrationPath="/trainer-registration" />)}
          </div>
          <Included items={trainerIncluded} />
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">For Gyms, Academies &amp; Wellness Centres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {gymPlans.map((p) => <PlanCard key={p.id} plan={p} registrationPath="/facility-registration" />)}
          </div>
          <Included items={gymIncluded} />
        </div>

        <div className="bg-gradient-to-r from-secondary to-secondary/80 text-white rounded-lg p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold mb-3">One-Time Referral Commission</h3>
          <p className="text-lg mb-4">Charged only once — on a client's first successful registration or booking through FitLink</p>
          <div className="text-4xl font-bold">1–2%</div>
          <p className="text-sm mt-2">Of the first registration or booking fee · no commission on repeat bookings with the same client</p>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join-trainer"><Button size="lg">Join as Trainer</Button></Link>
            <Link to="/register-facility"><Button size="lg" variant="outline">Register Your Facility</Button></Link>
          </div>
        </div>
      </div>

    </>
  );
}
