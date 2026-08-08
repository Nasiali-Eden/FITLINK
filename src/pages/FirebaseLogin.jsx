import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import Logo from "../components/Logo.jsx";
import { Card, Button } from "../components/Ui.jsx";
import { auth, db } from "../lib/firebase.js";
import { dashboardAccess } from "../lib/registrationConfig.js";
import { authErrorMessage, ensureClientProfile, postAuthRoute, safeReturnUrl } from "../lib/auth.js";

export default function FirebaseLogin() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [saving, setSaving] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const navigate = useNavigate(); const [searchParams] = useSearchParams(); const returnTo = safeReturnUrl(searchParams.get("returnTo"), "");
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    let credential;
    try { credential = await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch (loginError) { console.error("Credential authentication failed", loginError); setError(authErrorMessage(loginError)); setSaving(false); return; }
    try {
      const { profile: account } = await ensureClientProfile(db, credential.user);
      const access = dashboardAccess(account); const destination = postAuthRoute(account, returnTo);
      if (access === "pending") { setMessage("You are signed in. Your provider application is still being reviewed; the dashboard will open after approval."); setSaving(false); }
      else navigate(destination, { replace: true });
    } catch (profileError) { console.error("Authentication succeeded but profile loading failed", profileError); setError(`You are signed in, but we could not load or repair your profile. ${authErrorMessage(profileError, "load the profile")}`); setSaving(false); }
  };
  const reset = async () => { setError(""); setMessage(""); if (!email.trim()) { setError("Enter your email first, then select Forgot password."); return; } try { await sendPasswordResetEmail(auth, email.trim()); setMessage("Password-reset email sent."); } catch (resetError) { console.error("Password reset failed", resetError); setError(authErrorMessage(resetError, "send the reset email")); } };
  return <div className="flex-1 container flex min-h-[70vh] items-center justify-center py-14"><Card className="w-full max-w-md p-8 gap-0"><div className="flex justify-center mb-6"><Logo /></div><h1 className="text-center text-2xl font-bold text-secondary">Welcome back</h1><p className="mt-1 text-center text-sm text-slate-500 mb-7">Clients can continue bookings. Approved providers can manage listings, bookings, reviews, and membership details.</p><form className="space-y-4" onSubmit={submit}><label className="block"><span className="label">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@email.com" className="field" /></label><label className="block"><span className="label">Password</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••••" className="field" /></label><div className="text-right"><button type="button" onClick={reset} className="text-sm font-medium text-primary hover:underline">Forgot password?</button></div>{message && <p role="status" className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p>}{error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" size="lg" className="w-full" disabled={saving}>{saving ? "Opening your account…" : "Log In"}</Button></form><p className="mt-6 text-center text-sm text-slate-500">New client? <Link to={`/signup?returnTo=${encodeURIComponent(returnTo || "/my-bookings")}`} className="font-semibold text-primary hover:underline">Create an account</Link></p></Card></div>;
}
