import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, Copy, LockKeyhole, Smartphone, X } from "lucide-react";
import { Button } from "./Ui.jsx";
import { createBooking, friendlyBookingError } from "../lib/bookings.js";
import { MPESA_NUMBER_DISPLAY, MPESA_NUMBER_E164 } from "../lib/registrationConfig.js";
import { useAuthUser } from "../hooks/useAuthUser.js";

const emptyAppointment = { service: "", date: "", time: "", note: "" };
const emptyPayment = { payerPhone: "", transactionCode: "", confirmed: false };

export default function PaymentModal({ open, onClose, provider, amount }) {
  const { user, loading: authLoading } = useAuthUser();
  const [appointment, setAppointment] = useState(emptyAppointment);
  const [payment, setPayment] = useState(emptyPayment);
  const [step, setStep] = useState("details");
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const returnTo = useMemo(() => `${window.location.pathname}?book=1`, []);
  const draftKey = `fitlink-booking-${provider?.id}`;
  const minDate = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (!open) return undefined;
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(draftKey)); } catch { /* ignore an invalid local draft */ }
    if (saved?.service && saved?.date && saved?.time) {
      setAppointment({ ...emptyAppointment, ...saved });
      setStep(user ? "payment" : "details");
    } else {
      setStep("details");
    }
    setPayment(emptyPayment);
    setError("");
    const old = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const inerted = [];
    let activeLayer = dialogRef.current;
    while (activeLayer?.parentElement && activeLayer.parentElement !== document.body) {
      const parent = activeLayer.parentElement;
      Array.from(parent.children).forEach((sibling) => {
        if (sibling !== activeLayer && sibling instanceof HTMLElement) {
          inerted.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      });
      activeLayer = parent;
    }
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus());
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') || []).filter((element) => !element.closest("[inert]") && element.getClientRects().length);
      if (!focusable.length) { event.preventDefault(); closeRef.current?.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = old;
      inerted.forEach(([element, previous]) => { element.inert = previous; });
      window.removeEventListener("keydown", keydown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, onClose, draftKey, user]);

  if (!open) return null;
  const updateAppointment = (field) => (event) => setAppointment((current) => ({ ...current, [field]: event.target.value }));
  const updatePayment = (field) => (event) => setPayment((current) => ({ ...current, [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  const continueFromDetails = (event) => {
    event.preventDefault(); setError("");
    const scheduledAt = new Date(`${appointment.date}T${appointment.time}:00`);
    if (scheduledAt.getTime() <= Date.now()) { setError("Choose a future appointment date and time."); return; }
    sessionStorage.setItem(draftKey, JSON.stringify(appointment));
    setStep(user ? "payment" : "gate");
  };

  const submitBooking = async (event) => {
    event.preventDefault(); setStep("processing"); setError("");
    try {
      if (!user) { setStep("gate"); return; }
      const scheduledAt = new Date(`${appointment.date}T${appointment.time}:00`);
      if (scheduledAt.getTime() <= Date.now()) throw new Error("Choose a future appointment date and time.");
      const result = await createBooking({
        providerId: provider.id,
        service: appointment.service.trim(),
        scheduledAt: scheduledAt.toISOString(),
        note: appointment.note.trim(),
        payerPhone: payment.payerPhone.trim(),
        transactionCode: payment.transactionCode.trim().toUpperCase(),
      });
      if (!result?.bookingId) throw new Error("The booking was not confirmed by the server.");
      sessionStorage.removeItem(draftKey);
      setStep("done");
    } catch (submissionError) {
      setError(submissionError.message?.startsWith("Choose") ? submissionError.message : friendlyBookingError(submissionError));
      setStep("payment");
    }
  };

  const visibleStep = ["details", "gate"].includes(step) ? 1 : step === "done" ? 3 : 3;
  return <div className="fixed inset-0 z-[110] flex items-end justify-center bg-secondary/75 p-3 backdrop-blur-sm sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="booking-title" className="max-h-[94vh] w-full min-w-0 max-w-xl overflow-x-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <header className="sticky top-0 z-10 border-b bg-white"><div className="flex min-w-0 items-start justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Request a booking</p><h2 id="booking-title" className="mt-1 break-words text-xl font-bold text-secondary [overflow-wrap:anywhere]">Book {provider.name}</h2></div><button ref={closeRef} type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100" aria-label="Close booking"><X size={20} /></button></div>{step !== "done" && <ol className="grid grid-cols-3 border-t text-center text-[10px] font-bold uppercase tracking-wide min-[390px]:text-[11px] sm:text-xs" aria-label="Booking progress"><Progress active={visibleStep >= 1} current={visibleStep === 1}>Appointment</Progress><Progress active={Boolean(user)} current={step === "gate"}>Account</Progress><Progress active={["payment", "processing"].includes(step)} current={["payment", "processing"].includes(step)}>M-Pesa</Progress></ol>}</header>

      {step === "done" && <div className="p-8 text-center sm:p-10"><CheckCircle2 className="mx-auto text-primary" size={64} /><h3 className="mt-5 text-2xl font-bold text-secondary">Booking request submitted</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">We received your M-Pesa confirmation details. FitLink will check the transaction, and the provider will confirm your appointment. Track progress under My bookings.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button to="/my-bookings" variant="primary">View my bookings</Button><Button variant="outline" onClick={onClose}>Close</Button></div></div>}

      {step === "gate" && <div className="p-7 sm:p-9"><span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary"><LockKeyhole /></span><h3 className="mt-5 text-xl font-bold text-secondary">Save this booking to your account</h3><p className="mt-2 text-sm leading-6 text-slate-600">Your appointment choice is saved on this device. Create an account or log in, then you will return directly to the M-Pesa step.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button to={`/signup?returnTo=${encodeURIComponent(returnTo)}`} variant="primary" size="lg">Create account</Button><Button to={`/login?returnTo=${encodeURIComponent(returnTo)}`} variant="outline" size="lg">Log in</Button></div><button type="button" onClick={() => setStep("details")} className="mt-5 text-sm font-semibold text-primary hover:underline">Edit appointment details</button></div>}

      {step === "details" && <form onSubmit={continueFromDetails} className="p-5 sm:p-7"><section><div className="flex items-center gap-2"><CalendarDays className="text-primary" size={20} /><h3 className="font-bold text-secondary">Choose your appointment</h3></div><p className="mt-1 text-sm text-slate-600">Select the service and a future date. An account is required on the next step.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Service"><input required className="field" value={appointment.service} onChange={updateAppointment("service")} placeholder="e.g. Monthly membership" /></Field><Field label="Date"><input required type="date" min={minDate} className="field" value={appointment.date} onChange={updateAppointment("date")} /></Field><Field label="Time"><input required type="time" className="field" value={appointment.time} onChange={updateAppointment("time")} /></Field><Field label="Note (optional)" className="sm:col-span-2"><textarea className="field h-auto py-3" rows="3" maxLength="500" value={appointment.note} onChange={updateAppointment("note")} placeholder="Anything the provider should know?" /></Field></div></section>{error && <ErrorMessage>{error}</ErrorMessage>}<Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={authLoading}>{authLoading ? "Checking account…" : user ? "Continue to M-Pesa" : "Continue to account"}</Button></form>}

      {["payment", "processing"].includes(step) && <form onSubmit={submitBooking} className="p-5 sm:p-7"><section><div className="flex items-center gap-2"><Smartphone className="text-primary" size={20} /><h3 className="font-bold text-secondary">Pay with M-Pesa</h3></div><p className="mt-1 text-sm leading-6 text-slate-600">Open M-Pesa, choose <strong>Send Money</strong>, and use the number and exact amount below. After payment, enter the confirmation details from your SMS.</p><div className="mt-4 rounded-xl border border-primary/20 bg-primary-soft p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-slate-500">M-Pesa Send Money number</p><p className="font-black text-secondary">{MPESA_NUMBER_DISPLAY}</p></div><button type="button" onClick={() => navigator.clipboard?.writeText(MPESA_NUMBER_E164)} className="grid size-9 place-items-center text-primary" aria-label="Copy M-Pesa number"><Copy size={17} /></button></div><p className="mt-3 flex justify-between border-t border-primary/15 pt-3 text-sm"><span>Exact amount to send</span><strong>KSh {Number(amount).toLocaleString()}</strong></p></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="M-Pesa phone number"><input required inputMode="tel" autoComplete="tel" className="field" value={payment.payerPhone} onChange={updatePayment("payerPhone")} placeholder="07XX XXX XXX" /></Field><Field label="Confirmation code from SMS"><input required minLength="10" maxLength="12" className="field uppercase" value={payment.transactionCode} onChange={updatePayment("transactionCode")} placeholder="e.g. TGH4AB12CD" /></Field></div><label className="mt-4 flex items-start gap-2 text-sm leading-5 text-slate-600"><input required type="checkbox" className="mt-1 accent-primary" checked={payment.confirmed} onChange={updatePayment("confirmed")} /><span>I have sent KSh {Number(amount).toLocaleString()} to {MPESA_NUMBER_DISPLAY} and entered the confirmation code exactly as shown in the M-Pesa SMS.</span></label></section>{error && <ErrorMessage>{error}</ErrorMessage>}<div className="mt-6 flex gap-3"><Button type="button" variant="outline" size="lg" onClick={() => setStep("details")} disabled={step === "processing"}>Back</Button><Button type="submit" variant="primary" size="lg" className="flex-1" disabled={step === "processing" || !payment.confirmed}>{step === "processing" ? "Submitting confirmation…" : "Submit M-Pesa confirmation"}</Button></div><p className="mt-3 text-center text-xs leading-5 text-slate-500">This page does not initiate an STK push. Complete Send Money in M-Pesa first, and do not pay again if you already received a confirmation SMS.</p></form>}
    </div>
  </div>;
}

function Progress({ active, current, children }) { return <li aria-current={current ? "step" : undefined} className={`border-b-2 px-2 py-2.5 ${current ? "border-primary bg-primary-soft text-secondary" : active ? "border-primary text-primary" : "border-transparent text-slate-400"}`}>{children}</li>; }
function ErrorMessage({ children }) { return <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{children}</p>; }
function Field({ label, className = "", children }) { return <label className={`block ${className}`}><span className="label">{label}</span>{children}</label>; }
