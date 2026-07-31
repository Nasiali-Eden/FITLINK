// Trainer directory — same data as the reference site. Replace with API later.
const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=600&q=70`;

export const trainers = [
  { id: 1, name: "James Kipchoge", specialty: "Athletics & Running", category: "Athletics",
    rating: 4.9, reviews: 127, location: "Nairobi", distance: "2.3 km away", price: 2500,
    verified: true, featured: true, photo: img("photo-1552674605-db6ffd4facb5"),
    bio: "Former national athlete coaching runners from beginners to podium finishers." },
  { id: 2, name: "Sarah Mwangi", specialty: "Yoga & Wellness", category: "Yoga",
    rating: 4.8, reviews: 89, location: "Nairobi", distance: "1.5 km away", price: 1500,
    verified: true, featured: true, photo: img("photo-1544367567-0f2fcb009e0b"),
    bio: "Certified yoga instructor blending breathwork and mobility for calm, resilient bodies." },
  { id: 3, name: "Peter Ochieng", specialty: "Football Coaching", category: "Football",
    rating: 4.7, reviews: 156, location: "Kisumu", distance: "156 km away", price: 3000,
    verified: true, featured: true, photo: img("photo-1526232761682-d26e03ac148e"),
    bio: "CAF-licensed coach developing young footballers into complete players." },
  { id: 4, name: "David Kariuki", specialty: "Personal Training & Strength", category: "Personal Training",
    rating: 4.6, reviews: 98, location: "Nairobi", distance: "3.1 km away", price: 2000,
    verified: true, featured: false, photo: img("photo-1571019613454-1cb2f99b2d8b"),
    bio: "Strength coach helping busy professionals build muscle and confidence." },
  { id: 5, name: "Grace Kiplagat", specialty: "Swimming Coaching", category: "Swimming",
    rating: 4.9, reviews: 112, location: "Mombasa", distance: "480 km away", price: 2200,
    verified: true, featured: false, photo: img("photo-1517836357463-d25dfeac3438"),
    bio: "Swim coach with a patient, safety-first approach for children and adults." },
  { id: 6, name: "Michael Omondi", specialty: "Martial Arts & Self-Defense", category: "Martial Arts",
    rating: 4.7, reviews: 76, location: "Nairobi", distance: "4.2 km away", price: 2800,
    verified: true, featured: false, photo: img("photo-1547941126-3d5322b218b0"),
    bio: "Certified martial arts coach running fitness and competitive classes for all ages." },
];

export const trainerCategories = ["All Trainers", "Personal Training", "Football", "Athletics", "Yoga", "Swimming", "Martial Arts"];
export const getTrainer = (id) => trainers.find((t) => String(t.id) === String(id));
