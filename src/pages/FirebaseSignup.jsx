import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Logo from "../components/Logo.jsx";
import { Card, Button } from "../components/Ui.jsx";
import { auth, db } from "../lib/firebase.js";
import { authErrorMessage, ensureClientProfile, safeReturnUrl } from "../lib/auth.js";

export default function FirebaseSignup() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", terms: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnUrl(searchParams.get("returnTo"), "/my-bookings");
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    let user = createdUser;
    if (!user) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        user = credential.user;
        setCreatedUser(user);
        await updateProfile(user, { displayName: form.name.trim() }).catch(() => {});
      } catch (signupError) {
        console.error("Account creation failed", signupError);
        setError(authErrorMessage(signupError, "create your account"));
        setSaving(false);
        return;
      }
    }
    try {
      await ensureClientProfile(db, user, { name: form.name, email: form.email, phone: form.phone });
      navigate(returnTo, { replace: true });
    } catch (profileError) {
      console.error("Account created but profile setup failed", profileError);
      setError(`Your sign-in account was created, but we could not finish its client profile. ${authErrorMessage(profileError, "finish the profile")}`);
      setSaving(false);
    }
  };

  return <div className="flex-1 container flex min-h-[70vh] items-center justify-center py-14"><Card className="w-full max-w-md p-8 gap-0"><div className="flex justify-center mb-6"><Logo /></div><h1 className="text-center text-2xl font-bold text-secondary">Create your account</h1><p className="mt-1 text-center text-sm text-slate-500 mb-6">Create a client account. Providers should apply through the <Link to="/pricing" className="font-semibold text-primary hover:underline">plans page</Link>.</p><form className="space-y-4" onSubmit={submit}><Field label="Full name"><input required value={form.name} onChange={update("name")} autoComplete="name" placeholder="Your name" className="field" /></Field><Field label="Email"><input required type="email" value={form.email} onChange={update("email")} autoComplete="email" placeholder="you@email.com" className="field" /></Field><Field label="Phone"><input required type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" placeholder="07XX XXX XXX" className="field" /></Field><Field label="Password"><input required minLength={8} type="password" value={form.password} onChange={update("password")} autoComplete="new-password" placeholder="At least 8 characters" className="field" disabled={Boolean(createdUser)} /></Field><label className="flex items-start gap-2 text-xs text-slate-500"><input required type="checkbox" checked={form.terms} onChange={update("terms")} className="mt-0.5 accent-primary" /> I agree to FitLink Kenya's Terms of Service and Privacy Policy.</label>{error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" size="lg" className="w-full" disabled={saving}>{saving ? "Setting up your account…" : createdUser ? "Retry profile setup" : "Create Account"}</Button></form><p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-primary hover:underline">Log in</Link></p></Card></div>;
}

function Field({ label, children }) { return <label className="block"><span className="block text-sm font-semibold text-secondary mb-2">{label}</span>{children}</label>; }
