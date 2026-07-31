import { Link } from "react-router-dom";
import { Star } from "lucide-react";

/* shadcn-style button — matches Manus site button variants */
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all shrink-0 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer";
const variants = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  outline: "border bg-transparent shadow-xs hover:bg-accent",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
  white: "bg-white text-primary shadow-xs hover:bg-slate-100",
  outlineWhite: "border border-white text-white bg-transparent hover:bg-white/10",
  ghost: "hover:bg-accent",
};
const sizes = {
  sm: "h-8 px-3 gap-1.5",
  default: "h-9 px-4 py-2",
  lg: "h-10 px-6",
  xl: "h-12 px-6",
};

export function Button({ to, href, variant = "default", size = "default", className = "", children, ...props }) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{children}</a>;
  return <button className={cls} {...props}>{children}</button>;
}

/* shadcn-style card shell used across the Manus site */
export function Card({ className = "", children, ...props }) {
  return (
    <div className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

/* 5-star row exactly like Manus: filled yellow + slate empty */
export function Stars({ rating, size = 16 }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size}
          className={i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} />
      ))}
    </div>
  );
}
