import { Link } from "react-router-dom";

export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-bold text-xl text-primary ${className}`}>
      <img src="/brand/fitlink-icon.jpeg" alt="FitLink Kenya" className="h-8 w-8" />
      <span>FitLink</span>
    </Link>
  );
}
