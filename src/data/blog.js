export const whatIsFitLinkBody = [
  "Finding the place to train in Kenya should feel straightforward. Instead, people depend on scattered social pages, forwarded contacts, or recommendations that are difficult to verify. FitLink brings that search into one practical platform, helping clients discover fitness options with clearer information before they commit their time or money.",
  "FitLink connects people with four kinds of providers: personal trainers, gyms, sports academies, and wellness centres. Each approved profile presents details such as location, services, pricing, availability, photographs, and contact information. Approval does not promise a result, but it creates a more accountable starting point than an unverified listing.",
  "A client can explore providers freely, choose a service and appointment time, then create an account or log in to complete a booking. For now, payment uses manual M-Pesa confirmation. The client sends the stated amount, submits the confirmation code, and waits while FitLink checks the transaction and the provider confirms the booking. This keeps the process understandable while payment automation is developed.",
  "Providers receive a dashboard for viewing booking requests, managing their listing, checking membership dates, and following customer feedback. Access depends on the provider's approved account and plan. The dashboard is intended to reduce missed messages and give each provider one organised place to manage activity coming through FitLink.",
  "Trust must continue after discovery. Reviews are limited to verified customers whose bookings have been confirmed, and rating access opens only after the waiting period. That connection between a booking and a review helps make feedback more useful for the next person choosing where to train.",
  "FitLink's long-term goal is simple: make fitness access across Kenya more trustworthy and practical. That means improving discovery, building reliable booking tools, supporting responsible providers, and learning from real customer experiences. We are beginning with the essentials, then strengthening the platform as the community grows.",
];

export const posts = [{
  id: "what-is-fitlink",
  slug: "what-is-fitlink",
  title: "What Is FitLink?",
  excerpt: "A founder's field note on how FitLink is making it easier to find, book, and review trusted fitness providers across Kenya.",
  body: whatIsFitLinkBody,
  coverImage: "/brand/fitlink-logo-horizontal.png",
  authorName: "Dennis Mwambu",
  authorPhoto: "",
  category: "Company News",
  publishedAt: "2026-08-06T09:00:00+03:00",
  readTimeMinutes: 2,
  featured: true,
  seoTitle: "What Is FitLink? | FitLink Kenya",
  seoDescription: "Learn how FitLink helps Kenyans discover approved fitness providers, book services and leave verified reviews.",
  tags: ["FitLink", "Kenya", "fitness"],
}];

export const blogCategories = ["All Articles", ...new Set(posts.map((post) => post.category))];
