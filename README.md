# FitLink Kenya

**Connecting Kenya to Trusted Fitness Professionals.**

Vite + React marketplace website. Design matches the FitLink Kenya reference site
(hero, cards, sections, pages), using the FitLink logo green (#539E39) as the primary color.

## Run it locally

Requires Node.js 18+. In this folder:

```bash
npm install     # first time only
npm run dev     # opens at http://localhost:5173
```

Production build: `npm run build` (outputs to /dist), preview with `npm run preview`.

## Pages

- `/`                      Home — gradient hero + image, search band, categories, featured trainers, why choose + stats, CTA
- `/find-trainer`          Sidebar filters (search + category) with detailed trainer cards
- `/find-gym`              Gym search band + gym cards
- `/pricing`               Trainer & gym plans, What's Included, booking commission, CTA
- `/blog`                  Article grid with category filter + newsletter signup
- `/success-stories`       Stats + testimonial cards + CTA
- `/join-trainer`          Trainer marketing page (How It Works, benefits, stats, CTA)
- `/register-facility`     Facility onboarding page (gym, academy, wellness)
- `/trainer-registration`  5-step registration: details → docs → plan → M-Pesa payment → verified
- `/facility-registration` Facility application + conditional manual payment proof
- `/trainer/:id`, `/gym/:id`  Profile pages with booking/enquiry panel
- `/login`, `/signup`, `/contact`, 404
- `/dashboard`               Auth-aware provider overview with booking KPIs and account status

## Tech

- Vite + React 19, React Router 7, Tailwind CSS v4, lucide-react icons
- shadcn-style UI primitives in `src/components/Ui.jsx` (Button, Card, Stars)
- Mock data in `src/data/` (trainers, gyms, pricing, blog, stories) — swap for an API later

## Payments (M-Pesa)

`src/components/PaymentModal.jsx` has the payment UI and documented Safaricom
Daraja STK Push integration stubs (front-end only, no real charges). Wire
`payWithMpesa()` to a backend endpoint to go live. Cards: use Flutterwave/Paystack hosted fields.

## Next steps

1. Backend + database (trainers, gyms, bookings, users, payments)
2. Real auth + admin verification dashboard
3. M-Pesa Daraja + card payments
4. Booking calendar & reviews
5. Trainer / gym / client dashboards
