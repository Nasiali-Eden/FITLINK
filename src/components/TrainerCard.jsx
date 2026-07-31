import { useNavigate } from "react-router-dom";
import { Shield, MapPin } from "lucide-react";
import { Card, Button, Stars } from "./Ui.jsx";

/* Trainer card — exact Manus layout.
   `detailed` adds the distance row + View Profile button (listing page). */
export default function TrainerCard({ trainer: t, detailed = false }) {
  const navigate = useNavigate();
  return (
    <Card className="py-0 gap-0 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        <img src={t.photo} alt={t.name} loading="lazy" className="w-full h-full object-cover" />
        {t.verified && (
          <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
            <Shield size={12} /> Verified
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-900 mb-1">{t.name}</h3>
        <p className="text-sm text-slate-600 mb-3">{t.specialty}</p>
        <div className="flex items-center gap-1 mb-3">
          <Stars rating={t.rating} />
          <span className="text-sm font-semibold text-slate-900">{t.rating}</span>
          <span className="text-xs text-slate-600">({t.reviews})</span>
        </div>
        <div className="space-y-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{t.location}</span>
          </div>
          {detailed && (
            <div className="flex items-center gap-2">
              <span className="text-xs">📍</span>
              <span>{t.distance}</span>
            </div>
          )}
        </div>
        <div className={`font-semibold text-primary ${detailed ? "text-base mb-3" : "mb-3"}`}>
          KSh {t.price.toLocaleString()}/hr
        </div>
        <div className="space-y-2">
          {detailed && (
            <Button className="w-full" onClick={() => navigate(`/trainer/${t.id}`)}>View Profile</Button>
          )}
          <Button className="w-full" variant={detailed ? "outline" : "default"}
            onClick={() => navigate(`/trainer/${t.id}`)}>
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
