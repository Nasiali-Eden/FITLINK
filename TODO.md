# FitLink pending work

- [ ] Google Sheets integration: create the destination Sheet, add its ID to `scripts/.env`, share it with the Firebase service-account email, and schedule `npm run sync-sheets`. This was intentionally deferred on 2026-08-02.
- [ ] Replace the demo Pochi Till flow with Safaricom Daraja/paybill payment verification before production launch.
- [ ] Add and verify `RESEND_API_KEY` in Firebase Functions secrets, and verify `fitlink.co.ke` in Resend so `notifications@fitlink.co.ke` can send registration emails.
- [ ] Enable Firebase App Check and configure a Google Cloud budget alert before public launch.
