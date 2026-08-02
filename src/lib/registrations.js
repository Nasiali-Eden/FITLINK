import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "./firebase.js";

const cleanFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "-");

async function uploadFile(file, path) {
  if (!file) return null;
  const fileRef = ref(storage, `${path}/${Date.now()}-${cleanFileName(file.name)}`);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}

export async function createProviderRegistration({ type, details, plan, payment, publicPhotos = [], privateDocuments = {} }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please create an account or log in before submitting your registration.");

  const providerRef = doc(collection(db, "providers"));
  const publicPhotoUrls = [];
  for (const photo of publicPhotos.filter(Boolean)) {
    publicPhotoUrls.push(await uploadFile(photo, `public/providers/${user.uid}/${providerRef.id}`));
  }

  const documentUrls = {};
  for (const [label, file] of Object.entries(privateDocuments)) {
    if (file) documentUrls[label] = await uploadFile(file, `uploads/${user.uid}/${providerRef.id}`);
  }

  const record = {
    ...details,
    type,
    ownerUid: user.uid,
    email: details.email || user.email,
    approved: false,
    status: "pending",
    plan: plan.id,
    planName: plan.name,
    planPriceKes: plan.price,
    payment: { ...payment, submittedAt: new Date().toISOString() },
    photo: publicPhotoUrls[0] || "",
    photos: publicPhotoUrls,
    documents: documentUrls,
    rating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(providerRef, record);
  await setDoc(doc(db, "users", user.uid), {
    role: "provider",
    registrationType: type,
    providerId: providerRef.id,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return providerRef.id;
}
