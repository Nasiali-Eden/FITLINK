const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=700&q=70`;

export const stories = [
  { id: 1, name: "Amara Johnson", result: "Lost 25kg in 6 Months", trainer: "Sarah Mwangi", date: "Jun 2024",
    quote: "Finding Sarah through FitLink Kenya changed my life. She created a personalized plan that fit my lifestyle, and the results speak for themselves. I'm more confident and healthier than ever!",
    photo: img("photo-1487412720507-e7ab37603c6f") },
  { id: 2, name: "Kariuki Mwangi", result: "Improved Athletic Performance", trainer: "James Kipchoge", date: "May 2024",
    quote: "As a runner, I needed specialized coaching. James helped me improve my 10K time by 5 minutes. His expertise and dedication are unmatched. Highly recommend!",
    photo: img("photo-1552674605-db6ffd4facb5") },
  { id: 3, name: "Grace Ochieng", result: "Found Peace Through Yoga", trainer: "Sarah Mwangi", date: "Apr 2024",
    quote: "I was stressed and looking for a way to relax. Sarah's yoga classes have been transformative. I sleep better, feel calmer, and have more energy throughout the day.",
    photo: img("photo-1544367567-0f2fcb009e0b") },
  { id: 4, name: "David Kipchoge", result: "Built Strength & Confidence", trainer: "David Kariuki", date: "Mar 2024",
    quote: "I was intimidated by the gym, but David made me feel comfortable and confident. In 3 months, I've gained muscle, strength, and a new sense of self. FitLink Kenya is amazing!",
    photo: img("photo-1571019613454-1cb2f99b2d8b") },
  { id: 5, name: "Zainab Hassan", result: "Returned to Sports After Injury", trainer: "Peter Ochieng", date: "Feb 2024",
    quote: "After a knee injury, I thought my football days were over. Peter's rehabilitation program helped me recover fully. I'm back on the field and playing better than before!",
    photo: img("photo-1526232761682-d26e03ac148e") },
  { id: 6, name: "Michael Kiplagat", result: "Gym Owner Success", trainer: "FitLink Kenya", date: "Jan 2024",
    quote: "Registering my gym on FitLink Kenya increased our membership inquiries by 300%. The platform is easy to use and the support team is fantastic. Best decision for my business!",
    photo: img("photo-1534438327276-14e5300c3a48") },
];
