const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=700&q=70`;

export const blogCategories = ["All Articles", "Fitness Tips", "Training", "Nutrition", "Recovery", "Mindset", "Workouts"];

export const posts = [
  { id: 1, category: "Fitness Tips", title: "5 Essential Tips for Starting Your Fitness Journey",
    excerpt: "Learn the fundamentals that will set you up for long-term success in fitness.",
    author: "James Kipchoge", date: "Jul 15, 2024", read: "5 min read", photo: img("photo-1517836357463-d25dfeac3438") },
  { id: 2, category: "Training", title: "How to Find the Right Personal Trainer for Your Goals",
    excerpt: "A comprehensive guide to choosing a trainer that matches your fitness objectives.",
    author: "Sarah Mwangi", date: "Jul 12, 2024", read: "7 min read", photo: img("photo-1571019613454-1cb2f99b2d8b") },
  { id: 3, category: "Nutrition", title: "Nutrition Basics: Fueling Your Body Right",
    excerpt: "Understanding macros, hydration, and meal timing for optimal performance.",
    author: "Grace Kiplagat", date: "Jul 10, 2024", read: "6 min read", photo: img("photo-1490645935967-10de6ba17061") },
  { id: 4, category: "Recovery", title: "Recovery Techniques Every Athlete Should Know",
    excerpt: "Maximize your gains with proper recovery methods and rest strategies.",
    author: "Peter Ochieng", date: "Jul 8, 2024", read: "5 min read", photo: img("photo-1544367567-0f2fcb009e0b") },
  { id: 5, category: "Mindset", title: "Building Consistency: The Secret to Long-Term Fitness Success",
    excerpt: "Discover how to build sustainable habits that lead to lasting results.",
    author: "David Kariuki", date: "Jul 5, 2024", read: "8 min read", photo: img("photo-1552674605-db6ffd4facb5") },
  { id: 6, category: "Workouts", title: "Home Workouts: Effective Training Without a Gym",
    excerpt: "Get fit at home with these proven exercises and workout routines.",
    author: "Michael Omondi", date: "Jul 1, 2024", read: "6 min read", photo: img("photo-1518611012118-696072aa579a") },
];
