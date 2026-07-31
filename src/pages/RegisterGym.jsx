import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Card, Button } from "../components/Ui.jsx";

const steps = [
  ["1", "Facility Details", "Add your gym, academy or wellness centre name, location, and contacts"],
  ["2", "Setup Profile", "Add photos, services, membership prices, and amenities"],
  ["3", "Choose Plan", "Select a subscription plan — same pricing for gyms, academies & wellness centres"],
  ["4", "Go Live", "Start receiving membership inquiries and bookings"],
];

const benefits = [
  "More Memberships", "More Visibility", "Trainer Listings", "Event Promotion",
  "Equipment Promotion", "Corporate Exposure", "Booking Management", "Analytics Dashboard",
];

const stats = [["150+", "Trusted Gyms"], ["10K+", "Active Members"], ["4.8★", "Average Rating"]];

export default function RegisterGym() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-3">Register Your Gym, Academy or Wellness Centre</h1>
          <p className="text-lg text-primary-foreground/90">
            Increase visibility. Attract more members. Manage everything in one place.
          </p>
        </div>
      </section>

      <div className="flex-1 container py-16">
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {steps.map(([n, title, body]) => (
              <Card key={n} className="p-6 relative gap-0">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mb-4">{n}</div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600">{body}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">Benefits for Your Facility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="font-semibold text-slate-900">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-8 md:p-12 mb-16">
          <div className="grid grid-cols-3 gap-6 text-center">
            {stats.map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{n}</div>
                <p className="text-sm md:text-base">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Ready to put your facility on the map?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Register today and start receiving membership inquiries.
          </p>
          <Link to="/gym-registration"><Button size="lg">Register Your Facility</Button></Link>
        </div>
      </div>
    </>
  );
}
