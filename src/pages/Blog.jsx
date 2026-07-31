import { useMemo, useState } from "react";
import { User, Calendar, Clock } from "lucide-react";
import { Card, Button } from "../components/Ui.jsx";
import { posts, blogCategories } from "../data/blog.js";

export default function Blog() {
  const [cat, setCat] = useState("All Articles");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const results = useMemo(() =>
    cat === "All Articles" ? posts : posts.filter((p) => p.category === cat), [cat]);

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">FitLink Kenya Blog</h1>
          <p className="text-lg text-primary-foreground/90">Expert tips, training guides, and fitness inspiration</p>
        </div>
      </section>

      <div className="flex-1 container py-12">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {blogCategories.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cat === c ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {results.map((p) => (
            <Card key={p.id} className="py-0 gap-0 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative h-48 bg-slate-200 overflow-hidden">
                <img src={p.photo} alt={p.title} loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform" />
                <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  {p.category}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">{p.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{p.excerpt}</p>
                <div className="space-y-2 mb-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><User size={13} /><span>{p.author}</span></div>
                  <div className="flex items-center gap-2"><Calendar size={13} /><span>{p.date}</span></div>
                  <div className="flex items-center gap-2"><Clock size={13} /><span>{p.read}</span></div>
                </div>
                <div className="mt-auto">
                  <Button variant="outline" className="w-full">Read Article</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Stay Updated</h2>
          <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
            Subscribe to our newsletter for weekly fitness tips, training guides, and exclusive content from Kenya's top trainers.
          </p>
          {subscribed ? (
            <p className="font-semibold">✓ Subscribed — see you in your inbox!</p>
          ) : (
            <form className="max-w-md mx-auto flex gap-2"
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 rounded-md border-0 bg-white px-3 h-11 text-slate-900 outline-none" />
              <Button type="submit" variant="white" className="h-11">Subscribe</Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
