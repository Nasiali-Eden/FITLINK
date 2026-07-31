import { useState, useEffect } from "react";
import { Button } from "./Ui.jsx";

/**
 * Mock payment modal (Manus-styled).
 *
 * ── BACKEND INTEGRATION (M-Pesa Daraja STK Push) ──────────────────────────
 * 1. POST /api/mpesa/stk-push { phone, amount, accountRef, description }
 *    → backend gets OAuth token (consumer key/secret) then calls
 *      https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest with
 *      BusinessShortCode, Password (shortcode+passkey+timestamp), Timestamp,
 *      TransactionType "CustomerPayBillOnline", Amount, PartyA (phone),
 *      PartyB (shortcode), PhoneNumber, CallBackURL, AccountReference.
 * 2. Safaricom sends the STK prompt to the user's phone.
 * 3. Daraja hits your CallBackURL with the result → mark subscription paid,
 *    trigger admin verification, publish profile.
 * 4. Front-end polls GET /api/mpesa/status/:checkoutRequestId to update UI.
 * Cards: use a hosted PSP (Flutterwave/Paystack) — never raw card fields here.
 */
async function payWithMpesa({ phone, amount }) {
  await new Promise((r) => setTimeout(r, 2200)); // simulate STK push
  return { ok: true, receipt: "QGR" + Math.random().toString(36).slice(2, 9).toUpperCase() };
}

export default function PaymentModal({ open, onClose, onSuccess, title, amount, purpose = "payment" }) {
  const [method, setMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle");
  const [receipt, setReceipt] = useState("");

  useEffect(() => { if (open) { setStatus("idle"); setReceipt(""); } }, [open]);
  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setStatus("processing");
    const res = await payWithMpesa({ phone, amount });
    if (res.ok) { setReceipt(res.receipt); setStatus("done"); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border bg-white p-7 shadow-lg" onClick={(e) => e.stopPropagation()}>
        {status === "done" ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">✅</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Payment successful</h3>
            <p className="mt-2 text-sm text-slate-600">M-Pesa receipt <span className="font-semibold text-slate-900">{receipt}</span>.</p>
            <Button className="mt-6 w-full" onClick={() => { onClose(); onSuccess && onSuccess(); }}>Done</Button>
            <p className="mt-3 text-xs text-slate-400">Demo only — no real charge was made.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">Complete your {purpose}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-900" aria-label="Close">✕</button>
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Amount due</p>
              <p className="text-3xl font-bold text-primary">KSh {amount.toLocaleString()}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {[["mpesa", "M-Pesa"], ["card", "Card"]].map(([v, l]) => (
                <button key={v} onClick={() => setMethod(v)}
                  className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition ${method === v ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600"}`}>
                  {l}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              {method === "mpesa" ? (
                <label className="block text-sm">
                  <span className="font-semibold text-slate-900">M-Pesa phone number</span>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XX XXX XXX" inputMode="tel"
                    className="border-input mt-1 w-full rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
                  <span className="mt-1 block text-xs text-slate-400">You'll receive an STK push to enter your PIN.</span>
                </label>
              ) : (
                <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                  Card payments are processed via a secure provider (Flutterwave / Paystack). Hosted card fields would appear here.
                </div>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={status === "processing"}>
                {status === "processing" ? "Processing…" : `Pay KSh ${amount.toLocaleString()}`}
              </Button>
            </form>
            <p className="mt-3 text-center text-xs text-slate-400">🔒 Secure payment · demo mode</p>
          </>
        )}
      </div>
    </div>
  );
}
