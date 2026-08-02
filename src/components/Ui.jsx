import { Link } from "react-router-dom";
import { Star } from "lucide-react";

/* shadcn-style button — matches Manus site button variants */
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all shrink-0 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer";
const variants = {
  default: "bg-accent text-accent-foreground shadow-xs hover:bg-[#E9752B] hover:text-white active:bg-[#C95F1C]",
  outline: "border-secondary/25 bg-transparent text-secondary shadow-xs hover:border-primary/40 hover:bg-primary-soft",
  secondary: "bg-secondary-soft text-secondary hover:bg-[#D7E2EC]",
  white: "bg-white text-secondary shadow-xs hover:bg-accent-soft",
  outlineWhite: "border border-white text-white bg-transparent hover:bg-white/10",
  ghost: "text-secondary hover:bg-secondary-soft",
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
