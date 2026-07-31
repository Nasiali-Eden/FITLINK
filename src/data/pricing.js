export const trainerPlans = [
  { id: "starter", name: "Starter", tagline: "Perfect for new trainers", price: 1500,
    cta: "Get Started", popular: false,
    features: ["Basic profile listing", "Up to 5 bookings/month", "Booking calendar", "Client reviews", "Email support"] },
  { id: "professional", name: "Professional", tagline: "Most popular for active trainers", price: 3000,
    cta: "Choose Plan", popular: true,
    features: ["Featured listing", "Priority search results", "Unlimited bookings", "Verified badge", "Analytics dashboard", "Marketing support", "Priority support"] },
  { id: "premium", name: "Premium", tagline: "For established professionals", price: 5000,
    cta: "Choose Plan", popular: false,
    features: ["Homepage feature", "Unlimited leads", "Advanced analytics", "Personal website profile", "Dedicated account manager", "Custom marketing campaigns"] },
];

export const trainerIncluded = [
  "Professional profile page", "Secure M-Pesa payments", "Booking management",
  "Client messaging", "Certificate uploads", "Mobile-friendly profile",
];

// Gym plans also apply to sports academies and wellness centres (same pricing).
export const gymPlans = [
  { id: "gym-starter", name: "Starter", tagline: "For new gyms, academies & wellness centres", price: 5000,
    cta: "Get Started", popular: false,
    features: ["Basic gym profile", "Up to 20 membership inquiries", "Trainer listings", "Gallery (10 photos)", "Email support"] },
  { id: "gym-premium", name: "Premium", tagline: "For established facilities", price: 10000,
    cta: "Choose Plan", popular: true,
    features: ["Featured placement", "Homepage promotion", "Unlimited membership inquiries", "Trainer recruitment tools", "Event promotion", "Gallery (unlimited photos)", "Analytics dashboard", "24/7 support"] },
];

export const gymIncluded = [
  "Professional gym profile", "Membership management", "Trainer directory",
  "Event promotion", "Photo gallery", "Booking system",
];
