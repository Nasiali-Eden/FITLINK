import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import FindTrainer from "./pages/FindTrainer.jsx";
import FindGym from "./pages/FindGym.jsx";
import Pricing from "./pages/Pricing.jsx";
import Blog from "./pages/Blog.jsx";
import FindAcademy from "./pages/FindAcademy.jsx";
import FindWellness from "./pages/FindWellness.jsx";
import FacilityProfile from "./pages/FacilityProfile.jsx";
import { getAcademy } from "./data/academies.js";
import { getWellness } from "./data/wellness.js";
import SuccessStories from "./pages/SuccessStories.jsx";
import JoinTrainer from "./pages/JoinTrainer.jsx";
import RegisterGym from "./pages/RegisterGym.jsx";
import TrainerRegistration from "./pages/TrainerRegistration.jsx";
import GymRegistration from "./pages/GymRegistration.jsx";
import TrainerProfile from "./pages/TrainerProfile.jsx";
import GymProfile from "./pages/GymProfile.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import Terms from "./pages/legal/Terms.jsx";
import Privacy from "./pages/legal/Privacy.jsx";
import Policies from "./pages/legal/Policies.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/find-trainer" element={<FindTrainer />} />
        <Route path="/find-gym" element={<FindGym />} />
        <Route path="/find-academy" element={<FindAcademy />} />
        <Route path="/find-wellness" element={<FindWellness />} />
        <Route path="/academy/:id" element={<FacilityProfile getItem={getAcademy} backTo="/find-academy" backLabel="Find Academy" listLabel="Programs" listKey="programs" priceLabel="Registration" priceKey="registration" priceUnit="/month" />} />
        <Route path="/wellness/:id" element={<FacilityProfile getItem={getWellness} backTo="/find-wellness" backLabel="Find Wellness" listLabel="Services" listKey="services" priceLabel="Sessions from" priceKey="sessionFrom" priceUnit="/session" />} />
        <Route path="/sports-coaches" element={<Navigate to="/find-trainer" replace />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/join-trainer" element={<JoinTrainer />} />
        <Route path="/register-gym" element={<RegisterGym />} />
        <Route path="/trainer-registration" element={<TrainerRegistration />} />
        <Route path="/gym-registration" element={<GymRegistration />} />
        <Route path="/trainer/:id" element={<TrainerProfile />} />
        <Route path="/gym/:id" element={<GymProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/register-academy" element={<RegisterGym />} />
        <Route path="/register-wellness" element={<RegisterGym />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
