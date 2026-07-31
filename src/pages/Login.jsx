import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { Card, Button } from "../components/Ui.jsx";

export default function Login() {
  return (
    <div className="flex-1 container flex min-h-[70vh] items-center justify-center py-14">
      <Card className="w-full max-w-md p-8 gap-0">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-center text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-slate-500 mb-7">Log in to manage your bookings and profile.</p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="block text-sm font-semibold text-slate-900 mb-2">Email or phone</span>
            <input placeholder="you@email.com" className="border-input w-full rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-slate-900 mb-2">Password</span>
            <input type="password" placeholder="••••••••" className="border-input w-full rounded-md border px-3 h-10 text-sm outline-none focus:border-primary" />
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="accent-primary" /> Remember me</label>
            <a href="#" className="font-medium text-primary hover:underline">Forgot password?</a>
          </div>
          <Button type="submit" size="lg" className="w-full">Log In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to FitLink? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
