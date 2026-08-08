import ProviderApplicationForm from "../components/ProviderApplicationForm.jsx";
import { gymPlans } from "../data/pricing.js";

export default function FirebaseFacilityRegistration() {
  return <ProviderApplicationForm kind="facility" plans={gymPlans} />;
}
