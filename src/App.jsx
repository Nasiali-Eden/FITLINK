import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import FindTrainer from "./pages/FindTrainer.jsx";
import FindGym from "./pages/FindGym.jsx";
import Pricing from "./pages/Pricing.jsx";
import Blog from "./pages/Blog.jsx";
import FindAcademy from "./pages/FindAcademy.jsx";
import FindWellness from "./pages/FindWellness.jsx";
import FirebaseProviderProfile from "./pages/FirebaseProviderProfile.jsx";
import SuccessStories from "./pages/SuccessStories.jsx";
import JoinTrainer from "./pages/JoinTrainer.jsx";
import RegisterGym from "./pages/RegisterGym.jsx";
import TrainerRegistration from "./pages/FirebaseTrainerRegistration.jsx";
import GymRegistration from "./pages/FirebaseFacilityRegistration.jsx";
import Login from "./pages/FirebaseLogin.jsx";
import Signup from "./pages/FirebaseSignup.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import Terms from "./pages/legal/Terms.jsx";
import Privacy from "./pages/legal/Privacy.jsx";
import Policies from "./pages/legal/Policies.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import ClientBookings from "./pages/ClientBookings.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Events from "./pages/Events.jsx";
import EventDetail from "./pages/EventDetail.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/find-trainer" element={<FindTrainer />} />
        <Route path="/find-gym" element={<FindGym />} />
        <Route path="/find-academy" element={<FindAcademy />} />
        <Route path="/find-wellness" element={<FindWellness />} />
        <Route path="/academy/:id" element={<FirebaseProviderProfile expectedType="academy" />} />
        <Route path="/wellness/:id" element={<FirebaseProviderProfile expectedType="wellness" />} />
        <Route path="/sports-coaches" element={<Navigate to="/find-trainer" replace />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/join-trainer" element={<JoinTrainer />} />
        <Route path="/register-facility" element={<RegisterGym />} />
        <Route path="/trainer-registration" element={<TrainerRegistration />} />
        <Route path="/facility-registration" element={<GymRegistration />} />
        <Route path="/trainer/:id" element={<FirebaseProviderProfile expectedType="trainer" />} />
        <Route path="/gym/:id" element={<FirebaseProviderProfile expectedType="gym" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<ProviderDashboard />} />
        <Route path="/my-bookings" element={<ClientBookings />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/register-gym" element={<Navigate to="/register-facility" replace />} />
        <Route path="/gym-registration" element={<Navigate to="/facility-registration" replace />} />
        <Route path="/register-academy" element={<Navigate to="/register-facility" replace />} />
        <Route path="/register-wellness" element={<Navigate to="/register-facility" replace />} />
        <Route path="/academy-registration" element={<Navigate to="/facility-registration" replace />} />
        <Route path="/wellness-registration" element={<Navigate to="/facility-registration" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
