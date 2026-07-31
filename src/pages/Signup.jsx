import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { Card, Button } from "../components/Ui.jsx";

export default function Signup() {
  const [role, setRole] = useState("client");
  const navigate = useNavigate();
  const next = (e) => {
    e.preventDefault();
    if (role === "trainer") navigate("/trainer-registration");
    else if (role === "gym") navigate("/gym-registration");
  };
  return (
    <div className="flex-1 container flex min-h-[70vh] items-center justify-center py-14">
      <Card className="w-full max-w-md p-8 gap-0">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-center text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-center text-sm text-slate-500 mb-6">Join FitLink Kenya in under a minute.</p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {[["client", "Client"], ["trainer", "Trainer"], ["gym", "Gym"]].map(([v, l]) => (
            <button key={v} onClick={() => setRole(v)} type="button"
              className={`rounded-md border px-2 py-2 text-sm font-semibold transition ${role === v ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600"}`}>
              {l}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={next}>
          {[["Full name", "text", "Your name"], ["Email", "email", "you@email.com"], ["Phone", "tel", "07XX XXX XXX"], ["Password", "password", "Create a password"]].map(([label, type, ph]) => (
            <label key={label} className="block">
              <span className="block text-sm font-semibold text-slate-900 mb-2">{label}</span>
              <input type={type} placeholder={ph} className="border-input w-full rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
            </label>
          ))}
          <label className="flex items-start gap-2 text-xs text-slate-500">
            <input type="checkbox" className="mt-0.5 accent-primary" /> I agree to FitLink Kenya's Terms of Service and Privacy Policy.
          </label>
          <Button type="submit" size="lg" className="w-full">
            {role === "client" ? "Create Account" : role === "trainer" ? "Continue to Trainer Setup" : "Continue to Gym Setup"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
