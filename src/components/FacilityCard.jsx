import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Card, Button, Stars } from "./Ui.jsx";

/* Generic facility card (academies, wellness centres) — same Manus anatomy as GymCard. */
export default function FacilityCard({ item, listLabel, listValue, priceLabel, priceValue, priceUnit, viewPath, extra }) {
  const navigate = useNavigate();
  return (
    <Card className="py-0 gap-0 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        <img src={item.photo} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
        {extra && (
          <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">{extra}</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-900 mb-2">{item.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <Stars rating={item.rating} />
          <span className="text-sm font-semibold text-slate-900">{item.rating}</span>
          <span className="text-xs text-slate-600">({item.reviews})</span>
        </div>
        <div className="space-y-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-2"><MapPin size={14} /><span>{item.location}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs">📍</span><span>{item.distance}</span></div>
        </div>
        <div className="mb-3">
          <p className="text-xs text-slate-600 font-semibold mb-1">{listLabel}</p>
          <p className="text-sm text-slate-700">{listValue}</p>
        </div>
        <div className="mb-4 p-2 bg-slate-50 rounded">
          <p className="text-xs text-slate-600 font-semibold mb-1">{priceLabel}</p>
          <p className="text-sm font-semibold text-primary">KSh {priceValue.toLocaleString()}{priceUnit}</p>
        </div>
        <div className="space-y-2">
          <Button className="w-full" onClick={() => navigate(viewPath)}>View Profile</Button>
          <Button className="w-full" variant="outline" onClick={() => navigate(viewPath)}>Inquire</Button>
        </div>
      </div>
    </Card>
  );
}
