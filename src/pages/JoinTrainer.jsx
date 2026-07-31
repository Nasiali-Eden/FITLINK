import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Card, Button } from "../components/Ui.jsx";

const steps = [
  ["1", "Create Your Profile", "Add your personal details, certifications, and experience"],
  ["2", "Verify Your Credentials", "Upload your certificates, ID, and professional documents"],
  ["3", "Choose Your Plan", "Select a subscription plan that fits your needs"],
  ["4", "Start Receiving Bookings", "Get discovered by clients and start earning"],
];

const benefits = [
  "More Clients", "Online Presence", "Booking Calendar", "Receive Payments",
  "Build Your Reputation", "Verified Profile", "Marketing Support", "Personal Website Profile",
];

const stats = [["500+", "Verified Trainers"], ["10K+", "Happy Clients"], ["50K+", "Bookings/Month"]];

export default function JoinTrainer() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-3">Join FitLink Kenya</h1>
          <p className="text-lg text-primary-foreground/90">
            Grow your fitness business. Reach more clients. Build your reputation.
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
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">Why Join FitLink Kenya?</h2>
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
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Ready to grow your fitness business?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Create your profile today. No credit card required.
          </p>
          <Link to="/trainer-registration"><Button size="lg">Get Started Now</Button></Link>
        </div>
      </div>
    </>
  );
}
