import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/brand/fitlink-icon.jpeg" alt="FitLink Kenya" className="h-8 w-8 rounded" />
              <span className="font-bold text-lg">FitLink Kenya</span>
            </div>
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
              <li><Link to="/success-stories" className="text-slate-400 hover:text-primary transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Professionals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/join-trainer" className="text-slate-400 hover:text-primary transition-colors">Join as Trainer</Link></li>
              <li><Link to="/register-gym" className="text-slate-400 hover:text-primary transition-colors">Register Gym</Link></li>
              <li><Link to="/pricing" className="text-slate-400 hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 text-slate-400" />
                <a href="mailto:dennismwanzia@gmail.com" className="text-slate-400 hover:text-primary transition-colors">dennismwanzia@gmail.com</a>
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

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">© 2024 FitLink Kenya. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
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
