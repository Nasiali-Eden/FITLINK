import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { CalendarDays, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Button } from "./Ui.jsx";
import Logo from "./Logo.jsx";
import { auth, db } from "../lib/firebase.js";
import { dashboardAccess } from "../lib/registrationConfig.js";

const links = [
  { to: "/find-trainer", label: "Find Trainer" },
  { to: "/find-gym", label: "Find Gym" },
  { to: "/find-academy", label: "Find Academy" },
  { to: "/find-wellness", label: "Wellness" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
  { to: "/events", label: "Events" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [accountAccess, setAccountAccess] = useState("signed-out");
  const member = user && ["limited", "allowed", "expired"].includes(accountAccess);
  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    setUser(nextUser);
    if (!nextUser) { setAccountAccess("signed-out"); return; }
    try {
      const snapshot = await getDoc(doc(db, "users", nextUser.uid));
      setAccountAccess(dashboardAccess(snapshot.exists() ? snapshot.data() : null));
    } catch { setAccountAccess("not-provider"); }
  }), []);
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        <Logo />

        <nav className="hidden xl:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => `px-4 py-2 text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-secondary/80 hover:text-primary"}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-3">{member ? <><span className="max-w-44 truncate text-sm font-semibold text-secondary">{user.displayName || user.email}</span><Button to="/dashboard" variant="primary" size="sm"><LayoutDashboard size={15} /> Dashboard</Button><Button variant="outline" size="sm" onClick={() => signOut(auth)}><LogOut size={15} /> Sign out</Button></> : user ? <><span className="max-w-44 truncate text-sm font-semibold text-secondary">{user.displayName || user.email}</span><Button to="/my-bookings" variant="primary" size="sm"><CalendarDays size={15} /> My bookings</Button><Button variant="outline" size="sm" onClick={() => signOut(auth)}><LogOut size={15} /> Sign out</Button></> : <><Button to="/login" variant="ghost" size="sm">Log in</Button><Button to="/join-trainer" variant="outline" size="sm">Join as Trainer</Button><Button to="/register-facility" size="sm">Register Facility</Button></>}</div>

        <button className="xl:hidden p-2 text-secondary hover:bg-secondary-soft rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden border-t border-slate-200 bg-white">
          <div className="container flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                {l.label}
              </NavLink>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-2">{member ? <><Button to="/dashboard" variant="primary" size="sm" onClick={() => setOpen(false)}>Dashboard</Button><Button variant="outline" size="sm" onClick={() => { setOpen(false); signOut(auth); }}>Sign out</Button></> : user ? <><Button to="/my-bookings" variant="primary" size="sm" onClick={() => setOpen(false)}>My bookings</Button><Button variant="outline" size="sm" onClick={() => { setOpen(false); signOut(auth); }}>Sign out</Button></> : <><Button to="/login" variant="outline" size="sm" onClick={() => setOpen(false)}>Log in</Button><Button to="/signup" variant="primary" size="sm" onClick={() => setOpen(false)}>Create account</Button><Button to="/join-trainer" variant="ghost" size="sm" onClick={() => setOpen(false)}>Join as Trainer</Button><Button to="/register-facility" variant="ghost" size="sm" onClick={() => setOpen(false)}>Register Facility</Button></>}</div>
          </div>
        </div>
      )}
    </header>
  );
}
