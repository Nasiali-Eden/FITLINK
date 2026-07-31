import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Card, Button, Stars } from "./Ui.jsx";

/* Gym card — exact Manus layout */
export default function GymCard({ gym: g }) {
  const navigate = useNavigate();
  return (
    <Card className="py-0 gap-0 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        <img src={g.photo} alt={g.name} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-900 mb-2">{g.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <Stars rating={g.rating} />
          <span className="text-sm font-semibold text-slate-900">{g.rating}</span>
          <span className="text-xs text-slate-600">({g.reviews})</span>
        </div>
        <div className="space-y-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{g.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">📍</span>
            <span>{g.distance}</span>
          </div>
        </div>
        <div className="mb-3">
          <p className="text-xs text-slate-600 font-semibold mb-1">Services</p>
          <p className="text-sm text-slate-700">{g.services}</p>
        </div>
        <div className="mb-4 p-2 bg-slate-50 rounded">
          <p className="text-xs text-slate-600 font-semibold mb-1">Membership</p>
          <p className="text-sm font-semibold text-primary">KSh {g.membership.toLocaleString()}/month</p>
        </div>
        <div className="space-y-2">
          <Button className="w-full" onClick={() => navigate(`/gym/${g.id}`)}>View Profile</Button>
          <Button className="w-full" variant="outline" onClick={() => navigate(`/gym/${g.id}`)}>Inquire</Button>
        </div>
      </div>
    </Card>
  );
}
