import ProviderApplicationForm from "../components/ProviderApplicationForm.jsx";
import { trainerPlans } from "../data/pricing.js";

export default function FirebaseTrainerRegistration() {
  return <ProviderApplicationForm kind="trainer" plans={trainerPlans} />;
}
