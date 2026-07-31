import { Link } from "react-router-dom";
import { Card, Button, Stars } from "../components/Ui.jsx";
import { stories } from "../data/stories.js";

const stats = [["10K+", "Happy Transformations"], ["4.8★", "Average Rating"], ["98%", "Satisfaction Rate"]];

export default function SuccessStories() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-3">Success Stories</h1>
          <p className="text-lg text-primary-foreground/90">Real transformations from real people on FitLink Kenya</p>
        </div>
      </section>

      <div className="flex-1 container py-16">
        <div className="grid grid-cols-3 gap-6 mb-16 text-center">
          {stats.map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{n}</div>
              <p className="text-sm md:text-base text-slate-600">{l}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {stories.map((s) => (
            <Card key={s.id} className="py-0 gap-0 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative h-48 bg-slate-200 overflow-hidden">
                <img src={s.photo} alt={s.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex gap-1 mb-3"><Stars rating={5} /></div>
                <p className="text-sm text-slate-700 mb-4 flex-1">"{s.quote}"</p>
                <div className="border-t border-slate-100 pt-4">
                  <p className="font-bold text-slate-900">{s.name}</p>
                  <p className="text-sm font-semibold text-primary">{s.result}</p>
                  <p className="text-xs text-slate-600 mt-1">Trainer: {s.trainer} · {s.date}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Transformation Today</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of Kenyans who found their perfect trainer on FitLink Kenya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/find-trainer"><Button size="lg" variant="white">Find Your Trainer</Button></Link>
            <Link to="/join-trainer"><Button size="lg" variant="outlineWhite">Become a Trainer</Button></Link>
          </div>
        </div>
      </div>
    </>
  );
}
