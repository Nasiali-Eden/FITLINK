import { Button } from "../components/Ui.jsx";

export default function NotFound() {
  return (
    <div className="flex-1 container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-slate-600">Sorry, the page you are looking for doesn't exist. It may have been moved or deleted.</p>
      <Button to="/" className="mt-8">Go Home</Button>
    </div>
  );
}
