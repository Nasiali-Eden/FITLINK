// Sports academies — registration priced like gym membership (per month).
const img = () => "/brand/fitlink-logo-full.jpeg";

export const academies = [
  { id: 1, name: "Nairobi Sports Academy", rating: 4.7, reviews: 64,
    location: "Kasarani, Nairobi", distance: "5.4 km away",
    programs: "Football, Athletics, Swimming Squads", registration: 8000,
    ages: "Ages 6–18", photo: img("photo-1526232761682-d26e03ac148e") },
  { id: 2, name: "Rift Valley Athletics Academy", rating: 4.9, reviews: 88,
    location: "Eldoret", distance: "312 km away",
    programs: "Distance Running, Track & Field", registration: 6500,
    ages: "Ages 10–21", photo: img("photo-1552674605-db6ffd4facb5") },
  { id: 3, name: "Coast Swim & Sports Academy", rating: 4.6, reviews: 47,
    location: "Nyali, Mombasa", distance: "480 km away",
    programs: "Swimming, Water Polo, Basketball", registration: 7000,
    ages: "Ages 5–17", photo: img("photo-1517836357463-d25dfeac3438") },
];

export const getAcademy = (id) => academies.find((a) => String(a.id) === String(id));
