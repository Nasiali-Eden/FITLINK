import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import EditorialCover from "../components/EditorialCover.jsx";
import { getBlogPost } from "../lib/content.js";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined);
  useEffect(() => { let active = true; getBlogPost(slug).then((result) => { if (active) setPost(result.item); }); return () => { active = false; }; }, [slug]);
  useEffect(() => { if (post?.seoTitle) document.title = post.seoTitle; return () => { document.title = "FitLink Kenya"; }; }, [post]);
  if (post === undefined) return <div className="container py-20"><div className="mx-auto h-80 max-w-3xl animate-pulse bg-slate-100" /></div>;
  if (!post) return <section className="container py-20 text-center"><h1 className="text-3xl font-black text-secondary">Article not found</h1><Link to="/blog" className="mt-5 inline-block font-bold text-primary">Return to the journal</Link></section>;
  return <article>
    <header className="bg-secondary py-14 text-white md:py-20"><div className="container max-w-5xl"><Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"><ArrowLeft size={16} />Journal</Link><div className="mt-8 h-1 w-16 bg-primary-bright" /><p className="mt-7 text-xs font-black uppercase tracking-[.22em] text-primary-bright">{post.category}</p><h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-7xl">{post.title}</h1><div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300"><strong className="text-white">By {post.authorName}</strong><span className="flex items-center gap-2"><Calendar size={16} />{new Intl.DateTimeFormat("en-KE", { dateStyle: "long" }).format(new Date(post.publishedAt))}</span><span className="flex items-center gap-2"><Clock size={16} />{post.readTimeMinutes} min read</span></div></div></header>
    <div className="container max-w-5xl py-10 md:py-16"><div className="min-h-72 overflow-hidden border bg-secondary"><EditorialCover post={post} /></div><div className="mx-auto mt-12 grid max-w-4xl md:grid-cols-[4px_1fr] md:gap-10"><div className="hidden bg-primary-bright md:block" /><div className="space-y-6 text-[17px] leading-8 text-slate-700">{post.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></div><footer className="mx-auto mt-12 max-w-4xl border-t border-slate-200 pt-7"><p className="text-sm font-bold text-secondary">Written by {post.authorName}</p><p className="mt-1 text-sm text-slate-500">A FitLink founder's field note.</p></footer></div>
  </article>;
}
