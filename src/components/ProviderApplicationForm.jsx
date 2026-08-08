import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, CheckCircle2, Copy, FileCheck2, ShieldCheck, Smartphone, Upload } from "lucide-react";
import { Button, Card } from "./Ui.jsx";
import { createProviderApplication, friendlyRegistrationError } from "../lib/registrations.js";
import { getPlan, isValidEmail, MPESA_NUMBER_DISPLAY, MPESA_NUMBER_E164, normalizeKenyanPhone, normalizeMpesaCode, validateFile } from "../lib/registrationConfig.js";

const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu (Eldoret)", "Kiambu", "Machakos", "Other"];
const specialties = ["Personal Training", "Football", "Athletics", "Yoga", "Swimming", "Martial Arts", "Nutrition", "Other"];
const facilityTypes = [["gym", "Gym"], ["academy", "Sports Academy"], ["wellness", "Wellness Centre"]];
const amenities = ["Free Weights", "Cardio Zone", "Pool", "Sauna", "Group Classes", "Personal Training", "Parking", "Showers", "Physiotherapy", "Nutrition"];
const initialTrainer = { fullName: "", phone: "", email: "", county: "", town: "", specialty: "", yearsExperience: "", certifications: "", ratePerHour: "", languages: "", availability: "", bio: "" };
const initialFacility = { type: "gym", name: "", ownerName: "", phone: "", email: "", county: "", town: "", mapUrl: "", openingHours: "", membershipFrom: "", description: "" };

export default function ProviderApplicationForm({ kind, plans }) {
  const isTrainer = kind === "trainer";
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const initialPlan = plans.find(({ id }) => id === requestedPlan) || plans[0];
  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState(initialPlan.id);
  const [form, setForm] = useState(isTrainer ? initialTrainer : initialFacility);
  const [account, setAccount] = useState({ password: "", confirmPassword: "" });
  const [payment, setPayment] = useState({ payerPhone: "", transactionCode: "" });
  const [files, setFiles] = useState({ publicFiles: [], privateFiles: {} });
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const idempotencyKey = useRef(crypto.randomUUID());
  const type = isTrainer ? "trainer" : form.type;
  const plan = getPlan(planId, type) || plans[0];
  const steps = ["Choose plan", "Your details", plan.membershipEligible ? "Account & payment" : "Account & review"];
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const planSummary = useMemo(() => plan.membershipEligible
    ? "Includes member login and full dashboard access after FitLink verifies your payment and approves your application."
    : "Includes a public listing and simple dashboard after approval, with listing status, membership expiry, reviews, and limited recent bookings.", [plan]);

  const choosePlan = (id) => {
    setPlanId(id);
    setSearchParams({ plan: id }, { replace: true });
    setError("");
  };

  const validateDetails = () => {
    const required = isTrainer ? ["fullName", "phone", "email", "county", "town", "specialty", "ratePerHour", "bio"] : ["name", "ownerName", "phone", "email", "county", "town", "membershipFrom", "description"];
    if (required.some((field) => !String(form[field] || "").trim())) return "Complete all required fields before continuing.";
    if (!normalizeKenyanPhone(form.phone)) return "Enter a valid Kenyan phone number, for example 0712 345 678.";
    if (!isValidEmail(form.email)) return "Enter a valid email address.";
    if (isTrainer && Number(form.ratePerHour) <= 0) return "Enter your hourly rate.";
    if (!isTrainer && Number(form.membershipFrom) <= 0) return "Enter the facility price.";
    if (String(isTrainer ? form.bio : form.description).trim().length < 30) return "Add a profile description of at least 30 characters.";
    if (isTrainer && !files.publicFiles.length) return "Add a profile photo.";
    if (!isTrainer && !files.coverFile) return "Add exactly one facility cover image.";
    if (!isTrainer && files.galleryFiles?.length > 8) return "Facilities may add up to eight gallery images.";
    return "";
  };

  const next = () => {
    const validationError = step === 1 ? validateDetails() : "";
    if (validationError) { setError(validationError); return; }
    setError(""); setStep((current) => Math.min(current + 1, 2));
  };

  const submit = async () => {
    let validationError = validateDetails();
    if (account.password.length < 8) validationError = "Create a password with at least 8 characters.";
    else if (account.password !== account.confirmPassword) validationError = "The passwords do not match.";
    else if (plan.membershipEligible && !normalizeKenyanPhone(payment.payerPhone)) validationError = "Enter the Kenyan M-Pesa number used to send the payment.";
    else if (plan.membershipEligible && !normalizeMpesaCode(payment.transactionCode)) validationError = "Enter the 10–12 character confirmation code from your M-Pesa SMS.";
    if (validationError) { setError(validationError); return; }
    setBusy(true); setError("");
    try {
      const details = isTrainer ? {
        name: form.fullName.trim(), ownerName: form.fullName.trim(), email: form.email.trim().toLowerCase(), phone: normalizeKenyanPhone(form.phone), county: form.county, town: form.town.trim(), location: `${form.town.trim()}, ${form.county}`, specialty: form.specialty, category: form.specialty, yearsExperience: Number(form.yearsExperience || 0), certifications: form.certifications.trim(), pricePerHour: Number(form.ratePerHour), languages: form.languages.trim(), availability: form.availability.trim(), bio: form.bio.trim(),
      } : {
        name: form.name.trim(), ownerName: form.ownerName.trim(), email: form.email.trim().toLowerCase(), phone: normalizeKenyanPhone(form.phone), county: form.county, town: form.town.trim(), location: `${form.town.trim()}, ${form.county}`, mapUrl: form.mapUrl.trim(), openingHours: form.openingHours.trim(), services: selectedAmenities, membershipFrom: Number(form.membershipFrom), registrationFrom: Number(form.membershipFrom), sessionFrom: Number(form.membershipFrom), bio: form.description.trim(),
      };
      const publicFiles = isTrainer ? files.publicFiles.map((file) => ({ file, kind: "profilePhoto" })) : [{ file: files.coverFile, kind: "coverImage" }, ...(files.galleryFiles || []).map((file) => ({ file, kind: "galleryImage" }))];
      await createProviderApplication({ type, planId, details, account: { email: details.email, password: account.password }, paymentProof: plan.membershipEligible ? { payerPhone: normalizeKenyanPhone(payment.payerPhone), transactionCode: normalizeMpesaCode(payment.transactionCode) } : null, publicFiles, privateFiles: files.privateFiles, idempotencyKey: idempotencyKey.current });
      setSuccess({ membershipEligible: plan.membershipEligible });
    } catch (submissionError) {
      setError(friendlyRegistrationError(submissionError));
    } finally { setBusy(false); }
  };

  if (success) return <Success membershipEligible={success.membershipEligible} providerKind={kind} />;

  return <main className="flex-1 bg-[linear-gradient(180deg,#eaf0f6_0,#f8fafc_24rem,#f8fafc_100%)]">
    <header className="container max-w-6xl pt-7 sm:pt-10">
      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-primary" />
        <div className="grid md:grid-cols-[minmax(0,1.45fr)_minmax(16rem,.75fr)]">
          <div className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">FitLink application desk</p><h1 className="mt-2 text-3xl font-bold text-secondary sm:text-4xl">{isTrainer ? "Register as a Trainer" : "Register a Facility"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Submit your details for FitLink review. You do not need to log in first.</p></div>
          <div className="relative bg-secondary p-6 text-white sm:p-8"><div className="absolute inset-y-6 left-0 w-1 bg-primary" /><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Review promise</p><p className="mt-2 text-lg font-bold">{plan.name} · KSh {plan.price.toLocaleString()}</p><p className="mt-2 text-sm leading-6 text-slate-300">{planSummary}</p><div className="mt-4 flex items-start gap-2 border-t border-white/15 pt-4 text-xs leading-5 text-slate-300"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={16} />Private documents stay with the FitLink review team.</div></div>
        </div>
        <ol className="grid grid-cols-3 border-t border-slate-200 bg-slate-50" aria-label="Application progress">{steps.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={`relative flex min-h-14 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold sm:px-6 sm:text-sm ${index === step ? "border-primary bg-white text-secondary" : index < step ? "border-primary text-primary" : "border-transparent text-slate-500"}`}><span className={`grid size-6 shrink-0 place-items-center rounded-md ${index <= step ? "bg-primary text-white" : "bg-slate-200 text-slate-600"}`}>{index < step ? <Check size={14} /> : index + 1}</span><span>{label}</span></li>)}</ol>
      </div>
    </header>
    <div className="container max-w-4xl py-7 sm:py-10">
        <Card className="gap-0 border-t-4 border-t-secondary p-5 sm:p-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.18em] text-slate-500">Application form · Step {step + 1} of {steps.length}</p>
          {step === 0 && <PlanStep plans={plans} selected={planId} choose={choosePlan} />}
          {step === 1 && (isTrainer ? <TrainerDetails form={form} update={update} files={files} setFiles={setFiles} /> : <FacilityDetails form={form} update={update} files={files} setFiles={setFiles} amenities={selectedAmenities} setAmenities={setSelectedAmenities} />)}
          {step === 2 && <AccountStep plan={plan} email={form.email} account={account} setAccount={setAccount} payment={payment} setPayment={setPayment} />}
          {error && <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <div className="mt-8 flex items-center justify-between border-t pt-6"><Button type="button" variant="ghost" onClick={() => { setError(""); setStep((current) => Math.max(0, current - 1)); }} className={step === 0 ? "invisible" : ""}>← Back</Button>{step < 2 ? <Button type="button" variant="primary" size="lg" onClick={next}>Continue</Button> : <Button type="button" variant="primary" size="lg" disabled={busy} onClick={submit}>{busy ? "Submitting securely…" : plan.membershipEligible ? "Submit M-Pesa confirmation" : "Submit application"}</Button>}</div>
        </Card>
    </div>
  </main>;
}

function PlanStep({ plans, selected, choose }) { return <section><h2 id="plan-choice-heading" className="text-2xl font-bold text-secondary">Choose how you want to appear on FitLink</h2><p className="mt-2 text-sm text-slate-600">Every approved plan includes a provider dashboard; full member plans add advanced business tools.</p><div role="group" aria-labelledby="plan-choice-heading" className={`mt-6 grid gap-4 ${plans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>{plans.map((plan) => <button key={plan.id} type="button" aria-pressed={selected === plan.id} onClick={() => choose(plan.id)} className={`min-h-40 border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selected === plan.id ? "border-primary bg-primary-soft shadow-sm" : "border-slate-200 bg-white hover:border-primary/50"}`}><span className="flex items-center justify-between"><strong className="text-lg text-secondary">{plan.name}</strong>{selected === plan.id && <CheckCircle2 aria-hidden="true" className="text-primary" size={20} />}</span><span className="mt-2 block text-2xl font-black text-secondary">KSh {plan.price.toLocaleString()}</span><span className="mt-3 block text-sm leading-5 text-slate-600">{plan.membershipEligible ? "Member plan · full dashboard after approval" : "Starter listing · simple dashboard after approval"}</span></button>)}</div></section>; }

function TrainerDetails({ form, update, files, setFiles }) {
  const photoReady = files.publicFiles.length > 0;
  return <section>
    <StepHeading title="Trainer details" body="Start with the essentials. Optional profile details can be added without making the application feel longer." />
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Input label="Full name" required value={form.fullName} onChange={update("fullName")} />
      <Input label="Phone" required inputMode="tel" value={form.phone} onChange={update("phone")} />
      <Input label="Email" required type="email" value={form.email} onChange={update("email")} />
      <Select label="County" required value={form.county} onChange={update("county")} options={counties} />
      <Input label="Town / area" required value={form.town} onChange={update("town")} />
      <Select label="Main specialty" required value={form.specialty} onChange={update("specialty")} options={specialties} />
      <Input label="Rate per hour (KSh)" required type="number" min="1" value={form.ratePerHour} onChange={update("ratePerHour")} />
      <TextArea label="Short bio" required className="sm:col-span-2" value={form.bio} onChange={update("bio")} />
    </div>
    <details className="mt-6 border border-slate-200 bg-slate-50 open:bg-white">
      <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Add more profile details <span className="font-normal text-slate-500">(optional)</span></summary>
      <div className="grid gap-4 border-t p-4 sm:grid-cols-2">
        <Input label="Years of experience" type="number" min="0" value={form.yearsExperience} onChange={update("yearsExperience")} />
        <Input label="Certifications" value={form.certifications} onChange={update("certifications")} />
        <Input label="Languages" value={form.languages} onChange={update("languages")} />
        <Input label="Availability" value={form.availability} onChange={update("availability")} />
      </div>
    </details>
    <div className="mt-7 border-l-4 border-primary bg-primary-soft p-4">
      <p className="text-sm font-bold text-secondary">Required upload</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className={photoReady ? "text-primary" : "text-slate-400"} />Profile photo</p>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <FileField label="Profile photo *" image onFile={(file) => setFiles((old) => ({ ...old, publicFiles: file ? [file] : [] }))} />
      <FileField label="Certificate (optional)" onFile={(file) => setFiles((old) => ({ ...old, privateFiles: { ...old.privateFiles, certificate: file } }))} />
    </div>
  </section>;
}

function FacilityDetails({ form, update, files, setFiles, amenities: selected, setAmenities }) {
  const gallery = files.galleryFiles || [];
  const toggle = (item) => setAmenities((old) => old.includes(item) ? old.filter((value) => value !== item) : [...old, item]);
  const removeGallery = (index) => setFiles((old) => ({ ...old, galleryFiles: (old.galleryFiles || []).filter((_, position) => position !== index) }));
  const moveGallery = (index, offset) => setFiles((old) => {
    const next = [...(old.galleryFiles || [])];
    const target = index + offset;
    if (target < 0 || target >= next.length) return old;
    [next[index], next[target]] = [next[target], next[index]];
    return { ...old, galleryFiles: next };
  });
  return <section><StepHeading title="Facility details" body="Tell clients what your facility offers. FitLink will review everything before publication." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Select label="Facility type" required value={form.type} onChange={update("type")} options={facilityTypes} pairs /><Input label="Facility name" required value={form.name} onChange={update("name")} /><Input label="Owner / manager" required value={form.ownerName} onChange={update("ownerName")} /><Input label="Phone" required inputMode="tel" value={form.phone} onChange={update("phone")} /><Input label="Email" required type="email" value={form.email} onChange={update("email")} /><Select label="County" required value={form.county} onChange={update("county")} options={counties} /><Input label="Town / area" required value={form.town} onChange={update("town")} /><Input label="Prices from (KSh)" required type="number" min="1" value={form.membershipFrom} onChange={update("membershipFrom")} /><Input label="Opening hours" value={form.openingHours} onChange={update("openingHours")} /><Input label="Google Maps link" type="url" value={form.mapUrl} onChange={update("mapUrl")} /><TextArea label="Facility description" required className="sm:col-span-2" value={form.description} onChange={update("description")} /></div><fieldset className="mt-7"><legend className="label">Services & amenities</legend><div className="flex flex-wrap gap-2">{amenities.map((item) => <label key={item} className={`flex min-h-10 cursor-pointer items-center gap-2 border px-3 text-sm ${selected.includes(item) ? "border-primary bg-primary-soft text-secondary" : "bg-white text-slate-700"}`}><input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} className="accent-primary" />{item}</label>)}</div></fieldset><div className="mt-7 grid gap-5 sm:grid-cols-2"><div><p className="mb-2 text-sm font-bold text-secondary">Cover image *</p><FileField label="Choose 16:9 cover image" image onFile={(file) => setFiles((old) => ({ ...old, coverFile: file }))} />{files.coverFile && <ImagePreview file={files.coverFile} className="aspect-video" />}</div><div className="min-w-0"><p className="mb-2 text-sm font-bold text-secondary">Gallery images <span className="font-normal text-slate-500">({gallery.length}/8)</span></p><FileField label="Choose up to 8 gallery photos" image multiple maxFiles={8} onFiles={(chosen) => setFiles((old) => ({ ...old, galleryFiles: chosen }))} />{gallery.length > 0 && <ol className="mt-3 grid gap-3 sm:grid-cols-2">{gallery.map((file, index) => <GalleryPreview key={`${file.name}-${file.lastModified}`} file={file} index={index} total={gallery.length} remove={() => removeGallery(index)} move={(offset) => moveGallery(index, offset)} />)}</ol>}</div></div><p className="mt-3 text-xs leading-5 text-slate-500">Use a wide 16:9 cover for the main view. Additional JPG, PNG or WebP images appear as 4:3 thumbnails in the numbered order below.</p></section>;
}

function AccountStep({ plan, email, account, setAccount, payment, setPayment }) { return <section><StepHeading title="Create your FitLink account" body={plan.membershipEligible ? `Use ${email}. Full dashboard access opens after FitLink approves your details and confirms payment.` : `Use ${email}. After approval, you can sign in to a simple dashboard for your listing, expiry date, reviews, and recent bookings.`} /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Input label="Password" required type="password" autoComplete="new-password" value={account.password} onChange={(e) => setAccount((old) => ({ ...old, password: e.target.value }))} /><Input label="Confirm password" required type="password" autoComplete="new-password" value={account.confirmPassword} onChange={(e) => setAccount((old) => ({ ...old, confirmPassword: e.target.value }))} /></div>{plan.membershipEligible ? <><p className="mt-7 text-sm leading-6 text-slate-600">Open M-Pesa, choose <strong>Send Money</strong>, and enter the number and exact plan amount below. Then copy the confirmation code from your M-Pesa SMS.</p><div className="mt-3 border border-primary/25 bg-primary-soft p-5"><div className="flex items-start gap-3"><Smartphone className="mt-1 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">M-Pesa Send Money number</p><p className="mt-1 text-xl font-black text-secondary">{MPESA_NUMBER_DISPLAY}</p></div><button type="button" onClick={() => navigator.clipboard?.writeText(MPESA_NUMBER_E164)} className="grid size-10 place-items-center text-primary hover:bg-white" aria-label="Copy M-Pesa number"><Copy size={18} /></button></div><p className="mt-4 flex justify-between border-t border-primary/15 pt-4 text-sm"><span>Exact amount to send</span><strong className="text-lg text-secondary">KSh {plan.price.toLocaleString()}</strong></p></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Input label="M-Pesa phone number" required inputMode="tel" value={payment.payerPhone} onChange={(e) => setPayment((old) => ({ ...old, payerPhone: e.target.value }))} /><Input label="Confirmation code from SMS" required minLength="10" maxLength="12" className="uppercase" value={payment.transactionCode} onChange={(e) => setPayment((old) => ({ ...old, transactionCode: e.target.value.toUpperCase() }))} /></div><p className="mt-4 text-xs leading-5 text-slate-500">This form does not initiate an STK push. Complete Send Money first, then submit the confirmation code once. Do not pay again if you already received a confirmation SMS.</p></> : <div className="mt-7 border-l-4 border-accent bg-accent-soft p-5"><h3 className="font-bold text-secondary">{plan.name} includes a simple dashboard</h3><p className="mt-2 text-sm leading-6 text-slate-700">After approval, FitLink publishes your profile and opens a limited dashboard where you can check listing status, membership expiry, reviews, and recent bookings.</p></div>}</section>; }

function Success({ membershipEligible, providerKind }) { return <main className="flex flex-1 items-center bg-slate-50 py-16"><Card className="container mx-auto max-w-2xl items-center gap-0 p-8 text-center sm:p-12"><span className="grid size-16 place-items-center bg-primary-soft text-primary"><FileCheck2 size={32} /></span><h1 className="mt-6 text-3xl font-bold text-secondary">Application received</h1>{membershipEligible ? <p className="mt-4 max-w-xl leading-7 text-slate-600">We’ll verify your payment and details, then email you when your account is approved. Please wait for that confirmation email before logging in.</p> : <p className="mt-4 max-w-xl leading-7 text-slate-600">Your details were received. After approval, your profile will go online and your simple dashboard will show listing status, expiry, reviews, and recent bookings. Upgrade to {providerKind === "trainer" ? "Professional or Premium" : "Premium"} for full dashboard features.</p>}<Button to="/" variant="primary" size="lg" className="mt-8">Back to home</Button></Card></main>; }

function StepHeading({ title, body }) { return <div><h2 className="text-2xl font-bold text-secondary">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>; }
function Input({ label, required, className = "", ...props }) { return <label className="block"><span className="label">{label}{required ? " *" : ""}</span><input required={required} {...props} className={`field h-11 ${className}`} /></label>; }
function TextArea({ label, required, className = "", ...props }) { return <label className={`block ${className}`}><span className="label">{label}{required ? " *" : ""}</span><textarea required={required} rows="4" {...props} className="field h-auto py-3" /></label>; }
function Select({ label, options, pairs = false, required, ...props }) { return <label><span className="label">{label}{required ? " *" : ""}</span><select required={required} {...props} className="field h-11 bg-white"><option value="">Select…</option>{options.map((option) => { const [value, text] = pairs ? option : [option, option]; return <option key={value} value={value}>{text}</option>; })}</select></label>; }
function FileField({ label, image = false, multiple = false, maxFiles, onFile, onFiles }) { const [message, setMessage] = useState(""); const [invalid, setInvalid] = useState(false); const statusId = useId(); const change = (event) => { const chosen = Array.from(event.target.files || []); if (maxFiles && chosen.length > maxFiles) { setInvalid(true); setMessage(`Choose no more than ${maxFiles} images. No files were added.`); event.target.value = ""; return; } const fileError = chosen.map((file) => validateFile(file, { image })).find(Boolean); if (fileError) { setInvalid(true); setMessage(fileError); event.target.value = ""; onFile?.(null); onFiles?.([]); return; } setInvalid(false); setMessage(chosen.length === 1 ? `${chosen[0].name} ready` : chosen.length ? `${chosen.length} files ready` : "No file selected"); onFile?.(chosen[0] || null); onFiles?.(chosen); }; return <label className="block cursor-pointer border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"><Upload aria-hidden="true" className="mx-auto text-primary" size={22} /><span className="mt-2 block text-sm font-bold text-secondary">{label}</span><span className="mt-1 block text-xs text-slate-500">{image ? "JPG, PNG or WebP · max 8 MB" : "JPG, PNG, WebP or PDF · max 10 MB"}</span><input type="file" multiple={multiple} aria-describedby={statusId} aria-invalid={invalid || undefined} accept={image ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,application/pdf"} onChange={change} className="sr-only" /><span id={statusId} role="status" aria-live="polite" className={`mt-2 block min-h-4 text-xs font-semibold ${invalid ? "text-red-700" : "text-primary"}`}>{message}</span></label>; }
function ImagePreview({ file, className }) { const url = useMemo(() => URL.createObjectURL(file), [file]); useEffect(() => () => URL.revokeObjectURL(url), [url]); return <img src={url} alt={`${file.name} preview`} className={`mt-3 w-full rounded-md object-cover ${className}`} />; }
function GalleryPreview({ file, index, total, remove, move }) { const url = useMemo(() => URL.createObjectURL(file), [file]); useEffect(() => () => URL.revokeObjectURL(url), [url]); return <li className="min-w-0 overflow-hidden rounded-lg border bg-white"><div className="relative"><img src={url} alt={`Gallery photo ${index + 1}: ${file.name}`} className="aspect-[4/3] w-full object-cover" /><span className="absolute left-2 top-2 grid size-7 place-items-center rounded-md bg-secondary text-xs font-black text-white">{index + 1}</span></div><div className="min-w-0 p-2"><p className="truncate text-xs font-semibold text-secondary" title={file.name}>{file.name}</p><div className="mt-2 grid grid-cols-3 gap-1"><button type="button" disabled={index === 0} onClick={() => move(-1)} className="rounded border px-1 py-1 text-[11px] font-semibold text-secondary disabled:opacity-35">Earlier</button><button type="button" disabled={index === total - 1} onClick={() => move(1)} className="rounded border px-1 py-1 text-[11px] font-semibold text-secondary disabled:opacity-35">Later</button><button type="button" onClick={remove} className="rounded border border-red-200 px-1 py-1 text-[11px] font-semibold text-red-700">Remove</button></div></div></li>; }
