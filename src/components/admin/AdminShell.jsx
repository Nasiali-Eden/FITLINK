import { Activity, ClipboardCheck, LogOut, Menu, Users, X } from "lucide-react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import Logo from "../Logo.jsx";
import { auth } from "../../lib/firebase.js";

export default function AdminShell({ section, setSection, pendingCount, children }) {
  const [open, setOpen] = useState(false);
  const navigation = [
    { id: "users", label: "Users", icon: Users },
    { id: "requests", label: "Requests", icon: ClipboardCheck, count: pendingCount },
  ];
  const nav = <><div className="px-5 pb-7 pt-6"><Logo /></div><div className="px-3"><p className="px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-slate-400">Admin console</p><nav aria-label="Admin sections" className="mt-3 space-y-1">{navigation.map(({ id, label, icon: Icon, count }) => <button key={id} onClick={() => { setSection(id); setOpen(false); }} className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-bold transition ${section === id ? "border-primary bg-primary-soft text-primary" : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-secondary"}`}><Icon size={18} />{label}{count > 0 && <span className="ml-auto min-w-6 bg-accent-soft px-1.5 py-0.5 text-center text-xs text-amber-800">{count}</span>}</button>)}</nav></div><div className="mx-5 mt-auto border-l-2 border-primary bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-bold text-primary"><Activity size={15} /> Operations pulse</div><p className="mt-2 text-2xl font-black tabular-nums text-secondary">{pendingCount}</p><p className="text-xs text-slate-500">reviews awaiting action</p></div><button onClick={() => signOut(auth)} className="m-3 flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700"><LogOut size={17} /> Sign out</button></>;
  return <div className="min-h-screen bg-[#f3f7f9] text-secondary"><aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-white lg:flex">{nav}</aside><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden"><Logo /><button aria-label="Open admin navigation" onClick={() => setOpen(true)} className="grid size-10 place-items-center border bg-white"><Menu /></button></header>{open && <div className="fixed inset-0 z-40 bg-secondary/30 lg:hidden" onClick={() => setOpen(false)}><aside className="flex h-full w-72 flex-col bg-white shadow-xl" onClick={(event) => event.stopPropagation()}><button aria-label="Close admin navigation" onClick={() => setOpen(false)} className="absolute left-[17rem] top-3 grid size-9 place-items-center bg-secondary text-white"><X size={18} /></button>{nav}</aside></div>}<main className="min-h-screen lg:pl-64">{children}</main></div>;
}
