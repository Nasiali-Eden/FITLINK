import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Calendar, Clock, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card } from "../components/Ui.jsx";
import EditorialCover from "../components/EditorialCover.jsx";
import { getBlogPosts } from "../lib/content.js";

function dateLabel(value) {
  return new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("local");
  const [deliveryError, setDeliveryError] = useState(false);
  const [category, setCategory] = useState("All Articles");
  useEffect(() => { let active = true; getBlogPosts().then((result) => { if (active) { setPosts(result.items); setSource(result.source); setDeliveryError(Boolean(result.error)); setLoading(false); } }); return () => { active = false; }; }, []);
  const categories = useMemo(() => ["All Articles", ...new Set(posts.map((post) => post.category))], [posts]);
  const filtered = category === "All Articles" ? posts : posts.filter((post) => post.category === category);
  const featured = filtered.find((post) => post.featured) || filtered[0];
  const remaining = filtered.filter((post) => post !== featured);

  return <>
    <section className="relative overflow-hidden bg-secondary py-14 text-white md:py-20">
      <div className="absolute inset-y-0 right-0 w-1/3 border-l border-white/10 bg-primary/10 [transform:skewX(-10deg)_translateX(20%)]" />
      <div className="container relative"><p className="text-xs font-bold uppercase tracking-[.24em] text-primary-bright">The FitLink field journal</p><h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Useful ideas for moving Kenya.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Product notes, practical fitness guidance, and stories from the people building healthier routines.</p></div>
    </section>
    <div className="container py-10 md:py-14">
      <div className="mb-9 flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-2" aria-label="Filter articles">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`rounded-md border px-4 py-2 text-sm font-bold transition ${category === item ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-secondary hover:border-primary/50"}`}>{item}</button>)}</div><span className="text-xs text-slate-600">{source === "cms" ? "Published from the FitLink CMS" : deliveryError ? "Showing the local FitLink edition" : "FitLink journal edition"}</span></div>
      {loading ? <LoadingStories /> : featured ? <>
        <article className="grid overflow-hidden border-y border-slate-200 bg-white lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative min-h-64 overflow-hidden bg-secondary lg:min-h-[430px]"><EditorialCover post={featured} /></div>
          <div className="flex flex-col justify-center px-1 py-9 sm:px-8 lg:px-12"><div className="mb-6 h-1 w-16 bg-primary" /><p className="text-xs font-black uppercase tracking-[.2em] text-primary">{featured.category} · Featured</p><h2 className="mt-4 text-3xl font-black leading-tight text-secondary md:text-5xl">{featured.title}</h2><p className="mt-5 text-base leading-7 text-slate-600">{featured.excerpt}</p><Meta post={featured} /><Button to={`/blog/${featured.slug}`} variant="primary" size="lg" className="mt-7 w-fit">Read the field note <ArrowRight size={17} /></Button></div>
        </article>
        {remaining.length > 0 && <section className="mt-14"><h2 className="text-2xl font-black text-secondary">More from the journal</h2><div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{remaining.map((post) => <ArticleCard key={post.id} post={post} />)}</div></section>}
      </> : <EmptyStories />}
      <aside className="mt-16 border-l-4 border-accent bg-secondary px-6 py-8 text-white md:flex md:items-center md:justify-between md:gap-10 md:px-10"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">FitLink updates</p><h2 className="mt-2 text-2xl font-black">The newsletter is taking shape.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Email subscriptions are not connected yet. Check the journal for new guides and platform updates.</p></div><div className="mt-6 flex max-w-md gap-2 md:mt-0"><input disabled type="email" aria-label="Email address" placeholder="Email sign-up coming soon" className="h-11 min-w-0 flex-1 rounded-md border-white/20 bg-white/10 px-3 text-sm placeholder:text-slate-400" /><Button disabled variant="white" className="h-11">Coming soon</Button></div></aside>
    </div>
  </>;
}

function Meta({ post }) { return <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500"><span className="flex items-center gap-1.5"><PenLine size={14} />{post.authorName}</span><span className="flex items-center gap-1.5"><Calendar size={14} />{dateLabel(post.publishedAt)}</span><span className="flex items-center gap-1.5"><Clock size={14} />{post.readTimeMinutes} min read</span></div>; }
function ArticleCard({ post }) { return <Card className="overflow-hidden gap-0"><div className="h-48 bg-secondary"><EditorialCover post={post} compact /></div><div className="flex flex-1 flex-col p-5"><p className="text-xs font-black uppercase tracking-wider text-primary">{post.category}</p><h3 className="mt-2 text-xl font-black text-secondary"><Link to={`/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link></h3><p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p><Meta post={post} /><Link to={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Read article <ArrowRight size={15} /></Link></div></Card>; }
function LoadingStories() { return <div className="grid animate-pulse gap-6 lg:grid-cols-2" aria-label="Loading articles"><div className="h-80 bg-slate-100" /><div className="space-y-4 py-8"><div className="h-3 w-24 bg-slate-100" /><div className="h-12 w-3/4 bg-slate-100" /><div className="h-20 bg-slate-100" /></div></div>; }
function EmptyStories() { return <div className="border border-dashed border-slate-300 px-6 py-16 text-center"><h2 className="text-2xl font-black text-secondary">Fresh notes are on the way</h2><p className="mt-2 text-slate-600">There are no articles in this category yet.</p></div>; }
