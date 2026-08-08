import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase.js";

const fallbackPhoto = "/brand/fitlink-symbol.png";

export function normalizeProvider(snapshot) {
  const data = snapshot.data();
  const services = Array.isArray(data.services) ? data.services.join(", ") : (data.services || "");
  const location = data.location || [data.town, data.county].filter(Boolean).join(", ") || "Kenya";

  return {
    ...data,
    id: snapshot.id,
    name: data.name || data.fullName || "FitLink provider",
    photo: data.photo || data.photoUrl || data.profilePhotoUrl || fallbackPhoto,
    coverImageUrl: data.coverImageUrl || data.photo || data.photoUrl || fallbackPhoto,
    galleryImageUrls: Array.isArray(data.galleryImageUrls) ? data.galleryImageUrls : (Array.isArray(data.photos) ? data.photos.slice(1) : []),
    location,
    distance: data.distance || "Kenya",
    rating: Number(data.rating || 0),
    reviews: Number(data.reviewCount || data.reviews || 0),
    verified: data.approved === true,
    category: data.category || data.specialty || "Other",
    specialty: data.specialty || data.category || "Fitness professional",
    price: Number(data.pricePerHour || data.ratePerHour || data.price || 0),
    membership: Number(data.membershipFrom || data.membership || 0),
    services,
    programs: data.programs || services,
    registration: Number(data.registrationFrom || data.membershipFrom || 0),
    sessionFrom: Number(data.sessionFrom || data.membershipFrom || 0),
    bio: data.bio || "This provider has been reviewed and approved by FitLink Kenya.",
  };
}

export function useProviders(type) {
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const approvedQuery = query(collection(db, "providers"), where("approved", "==", true));
    return onSnapshot(approvedQuery, (snapshot) => {
      setAllProviders(snapshot.docs.map(normalizeProvider));
      setLoading(false);
      setError("");
    }, (firebaseError) => {
      console.error("Unable to load providers", firebaseError);
      setError("We could not load approved providers right now. Please try again shortly.");
      setLoading(false);
    });
  }, []);

  const providers = useMemo(
    () => type ? allProviders.filter((provider) => provider.type === type) : allProviders,
    [allProviders, type],
  );

  return { providers, loading, error };
}

export function useProvider(providerId) {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!providerId) return undefined;
    return onSnapshot(doc(db, "providers", providerId), (snapshot) => {
      setProvider(snapshot.exists() ? normalizeProvider(snapshot) : null);
      setLoading(false);
      setError("");
    }, (firebaseError) => {
      console.error("Unable to load provider", firebaseError);
      setError("We could not load this provider right now.");
      setLoading(false);
    });
  }, [providerId]);

  return { provider, loading, error };
}
