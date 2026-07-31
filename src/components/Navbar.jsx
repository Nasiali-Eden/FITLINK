import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./Ui.jsx";

const links = [
  { to: "/find-trainer", label: "Find Trainer" },
  { to: "/find-gym", label: "Find Gym" },
  { to: "/find-academy", label: "Find Academy" },
  { to: "/find-wellness", label: "Wellness" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <img src="/brand/fitlink-icon.jpeg" alt="FitLink Kenya" className="h-8 w-8" />
          <span className="hidden sm:inline">FitLink</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button to="/join-trainer" variant="outline" size="sm">Join as Trainer</Button>
          <Button to="/register-gym" size="sm">Register Gym</Button>
        </div>

        <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                {l.label}
              </NavLink>
            ))}
            <div className="flex gap-2 mt-2">
              <Button to="/join-trainer" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>Join as Trainer</Button>
              <Button to="/register-gym" size="sm" className="flex-1" onClick={() => setOpen(false)}>Register Gym</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
