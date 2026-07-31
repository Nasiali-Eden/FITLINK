// Gym directory — same data as the reference site.
const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=700&q=70`;

export const gyms = [
  { id: 1, name: "Elite Fitness Nairobi", rating: 4.8, reviews: 234,
    location: "Westlands, Nairobi", distance: "2.1 km away",
    services: "Gym, Personal Training, Classes", membership: 3500,
    photo: img("photo-1534438327276-14e5300c3a48") },
  { id: 2, name: "PowerHouse Gym Kisumu", rating: 4.6, reviews: 156,
    location: "Kisumu City Center", distance: "156 km away",
    services: "Gym, Yoga, Swimming", membership: 2500,
    photo: img("photo-1571902943202-507ec2618e8f") },
  { id: 3, name: "Urban Fitness Mombasa", rating: 4.7, reviews: 189,
    location: "Mombasa CBD", distance: "480 km away",
    services: "Gym, Martial Arts, Classes", membership: 3000,
    photo: img("photo-1540497077202-7c8a3999166f") },
];

export const getGym = (id) => gyms.find((g) => String(g.id) === String(id));
