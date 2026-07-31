import { Navigate } from "react-router-dom";
// Manus design has no separate sports-coaches page — redirect to Find Trainer.
export default function SportsCoaches() { return <Navigate to="/find-trainer" replace />; }
