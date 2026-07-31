// Wellness centres — same plan pricing as gyms on the provider side.
const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=700&q=70`;

export const wellnessCentres = [
  { id: 1, name: "Serenity Wellness Centre", rating: 4.9, reviews: 41,
    location: "Kilimani, Nairobi", distance: "2.8 km away",
    services: "Physiotherapy, Nutrition, Massage Therapy", sessionFrom: 2000,
    photo: img("photo-1540497077202-7c8a3999166f") },
  { id: 2, name: "Lakeview Recovery & Wellness", rating: 4.7, reviews: 33,
    location: "Milimani, Kisumu", distance: "156 km away",
    services: "Rehabilitation, Yoga Therapy, Counselling", sessionFrom: 1800,
    photo: img("photo-1544367567-0f2fcb009e0b") },
  { id: 3, name: "Coastal Calm Wellness Hub", rating: 4.8, reviews: 52,
    location: "Mombasa CBD", distance: "480 km away",
    services: "Spa Therapy, Nutrition, Pilates", sessionFrom: 2500,
    photo: img("photo-1534438327276-14e5300c3a48") },
];

export const getWellness = (id) => wellnessCentres.find((w) => String(w.id) === String(id));
