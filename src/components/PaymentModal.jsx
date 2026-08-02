import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Smartphone } from "lucide-react";
import { Button } from "./Ui.jsx";

const POCHI_PHONE = "0717 506 729";
const POCHI_E164 = "+254717506729";
const POCHI_NAME = "Dennis Mwanzia";

export default function PaymentModal({ open, onClose, onConfirm, onSuccess, title, amount, purpose = "payment" }) {
  const [payerPhone, setPayerPhone] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPayerPhone("");
      setTransactionCode("");
      setConfirmed(false);
      setStatus("idle");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setStatus("processing");
    setError("");
    try {
      const payment = {
        method: "pochi_demo",
        recipientPhone: POCHI_E164,
        recipientName: POCHI_NAME,
        payerPhone: payerPhone.trim(),
        transactionCode: transactionCode.trim().toUpperCase(),
        amountKes: Number(amount),
        status: "pending_verification",
      };
      if (onConfirm) await onConfirm(payment);
      else if (onSuccess) await onSuccess(payment);
      setStatus("done");
    } catch (submissionError) {
      console.error("Unable to submit payment confirmation", submissionError);
      setError(submissionError.message || "We could not save your registration. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-secondary/70 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="payment-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7" onClick={(event) => event.stopPropagation()}>
        {status === "done" ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            <h3 id="payment-title" className="mt-4 text-xl font-bold text-secondary">Registration received</h3>
            <p className="mt-2 text-sm text-slate-600">Your payment reference and registration details were saved. FitLink will verify the Pochi payment before approval.</p>
            <Button className="mt-6 w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">Demo Pochi payment</p>
                <h3 id="payment-title" className="text-xl font-bold text-secondary">{title}</h3>
                <p className="text-sm text-slate-500">Complete your {purpose}, then enter the M-Pesa confirmation below.</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-secondary" aria-label="Close payment dialog">×</button>
            </div>

            <div className="mt-5 rounded-xl border border-primary/20 bg-brand-soft p-5">
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Send to Pochi</p>
                  <p className="font-bold text-secondary">{POCHI_PHONE} · {POCHI_NAME}</p>
                </div>
                <button type="button" onClick={() => navigator.clipboard?.writeText(POCHI_E164)} className="ml-auto rounded-md p-2 text-primary hover:bg-primary/10" aria-label="Copy Pochi phone number"><Copy size={17} /></button>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-primary/15 pt-4">
                <span className="text-sm text-slate-600">Amount to send</span>
                <span className="text-2xl font-black text-secondary">KSh {Number(amount).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="font-semibold text-secondary">Phone used to pay</span>
                <input required value={payerPhone} onChange={(event) => setPayerPhone(event.target.value)} placeholder="07XX XXX XXX" inputMode="tel" autoComplete="tel" className="border-input mt-1 h-11 w-full rounded-md border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-secondary">M-Pesa transaction code</span>
                <input required minLength={8} maxLength={12} value={transactionCode} onChange={(event) => setTransactionCode(event.target.value)} placeholder="e.g. TGH4AB12CD" autoCapitalize="characters" className="border-input mt-1 h-11 w-full rounded-md border px-3 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input required type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 accent-primary" />
                <span>I confirm that I sent KSh {Number(amount).toLocaleString()} to {POCHI_PHONE}. I understand this demo payment will be verified manually.</span>
              </label>
              {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={status === "processing" || !confirmed}>
                {status === "processing" ? "Saving registration…" : "Submit payment & registration"}
              </Button>
            </form>
            <p className="mt-3 text-center text-xs text-slate-500">Demo only—this dialog does not initiate an STK push. Do not send another payment if you already received an M-Pesa confirmation.</p>
          </>
        )}
      </div>
    </div>
  );
}
