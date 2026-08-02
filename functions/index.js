import { initializeApp } from "firebase-admin/app";
import { defineSecret } from "firebase-functions/params";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";

initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");
const recipients = ["support@fitlink.co.ke", "fitlinkkenya@gmail.com"];

const safe = (value) => {
  if (value === undefined || value === null || value === "") return "Not provided";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

async function sendRegistrationEmail(subject, fields) {
  const rows = Object.entries(fields)
    .map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top">${label}</td><td style="padding:6px 0">${safe(value)}</td></tr>`)
    .join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "FitLink Kenya <notifications@fitlink.co.ke>",
      to: recipients,
      subject,
      html: `<h2>${subject}</h2><table>${rows}</table><p>Review and approve this registration in Firebase before it becomes public.</p>`,
    }),
  });

  if (!response.ok) throw new Error(`Resend returned ${response.status}: ${await response.text()}`);
}

export const notifyProviderRegistration = onDocumentCreated(
  { document: "providers/{providerId}", region: "europe-west1", secrets: [resendApiKey] },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    await sendRegistrationEmail(`New ${safe(data.type)} registration: ${safe(data.name)}`, {
      "Registration ID": event.params.providerId,
      Type: data.type,
      Name: data.name,
      "Contact person": data.ownerName,
      Email: data.email,
      Phone: data.phone,
      Location: data.location,
      Plan: data.planName || data.plan,
      "Amount (KES)": data.payment?.amountKes,
      "M-Pesa code": data.payment?.transactionCode,
      "Payer phone": data.payment?.payerPhone,
      Approved: data.approved,
    });
    logger.info("Provider registration notification sent", { providerId: event.params.providerId });
  },
);

export const notifyClientRegistration = onDocumentCreated(
  { document: "users/{uid}", region: "europe-west1", secrets: [resendApiKey] },
  async (event) => {
    const data = event.data?.data();
    if (!data || data.role !== "client") return;
    await sendRegistrationEmail(`New client registration: ${safe(data.name)}`, {
      "User ID": event.params.uid,
      Name: data.name,
      Email: data.email,
      Phone: data.phone,
      Role: data.role,
    });
    logger.info("Client registration notification sent", { uid: event.params.uid });
  },
);
