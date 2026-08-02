import { Link } from "react-router-dom";

export default function Logo({ className = "", inverted = false }) {
  return (
    <Link to="/" aria-label="Fitlink Kenya home" className={`inline-flex shrink-0 items-center gap-2 ${inverted ? "rounded-md bg-white px-2.5 py-1.5" : ""} ${className}`}>
      <img
        src="/brand/fitlink-symbol.png"
        alt=""
        aria-hidden="true"
        className="h-9 w-11 object-contain"
      />
      <span className="whitespace-nowrap text-lg font-bold tracking-tight text-secondary">Fitlink Kenya</span>
    </Link>
  );
}
