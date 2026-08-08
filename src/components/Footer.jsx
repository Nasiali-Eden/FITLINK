import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="bg-secondary text-slate-100 mt-20 [&_a:hover]:!text-primary-bright">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <Logo inverted className="mb-4 max-w-full" />
            <p className="text-sm text-slate-400">Connecting Kenya to Trusted Fitness Professionals</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/find-trainer" className="text-slate-400 hover:text-primary transition-colors">Find Trainer</Link></li>
              <li><Link to="/find-gym" className="text-slate-400 hover:text-primary transition-colors">Find Gym</Link></li>
              <li><Link to="/find-academy" className="text-slate-400 hover:text-primary transition-colors">Find Sports Academy</Link></li>
              <li><Link to="/find-wellness" className="text-slate-400 hover:text-primary transition-colors">Find Wellness Centre</Link></li>
              <li><Link to="/blog" className="text-slate-400 hover:text-primary transition-colors">Blog &amp; Resources</Link></li>
              <li><Link to="/events" className="text-slate-400 hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/success-stories" className="text-slate-400 hover:text-primary transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Professionals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/join-trainer" className="text-slate-400 hover:text-primary transition-colors">Join as Trainer</Link></li>
              <li><Link to="/register-facility" className="text-slate-400 hover:text-primary transition-colors">Register Facility</Link></li>
              <li><Link to="/pricing" className="text-slate-400 hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 text-slate-400" />
                <a href="mailto:support@fitlink.co.ke" className="text-slate-400 hover:text-primary transition-colors">support@fitlink.co.ke</a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 text-slate-400" />
                <a href="tel:+254717506729" className="text-slate-400 hover:text-primary transition-colors">+254 717 506 729</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-slate-400" />
                <span className="text-slate-400">Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">© 2024 FitLink Kenya. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm md:justify-end">
            <Link to="/privacy" className="text-slate-400 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-400 hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/policies" className="text-slate-400 hover:text-primary transition-colors">Platform Policies</Link>
            <Link to="/contact" className="text-slate-400 hover:text-primary transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
