import { posts as localPosts } from "../data/blog.js";
import { events as localEvents } from "../data/events.js";

const defaultEnv = import.meta.env || {};

export function contentfulConfig(env = defaultEnv) {
  const spaceId = env.VITE_CONTENTFUL_SPACE_ID?.trim();
  const environment = env.VITE_CONTENTFUL_ENVIRONMENT?.trim();
  const token = env.VITE_CONTENTFUL_DELIVERY_TOKEN?.trim();
  const locale = env.VITE_CONTENTFUL_LOCALE?.trim() || "en-US";
  return { spaceId, environment, token, locale, configured: Boolean(spaceId && environment && token) };
}

function assetUrl(asset) {
  const url = asset?.fields?.file?.url || asset?.url || "";
  return url.startsWith("//") ? `https:${url}` : url;
}

export function richTextToBlocks(document) {
  if (!document) return [];
  if (typeof document === "string") return document.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean);
  const blocks = [];
  const textContent = (node) => typeof node?.value === "string"
    ? node.value
    : (node?.content || []).map(textContent).join("");
  const visit = (node) => {
    const type = String(node?.nodeType || "");
    const isTextBlock = type === "paragraph" || type === "list-item" || /^heading-[1-6]$/.test(type);
    if (isTextBlock) {
      const text = textContent(node).replace(/\s+/g, " ").trim();
      if (text) blocks.push(text);
      return;
    }
    (node?.content || []).forEach(visit);
  };
  visit(document);
  return blocks;
}

function validDate(value) {
  return typeof value === "string" && value.trim() !== "" && Number.isFinite(Date.parse(value));
}

const BLOG_CATEGORIES = new Set(["Company News", "Fitness Tips", "Training", "Nutrition", "Recovery", "Mindset", "Workouts"]);
const EVENT_CATEGORIES = new Set(["Workout", "Competition", "Workshop", "Wellness", "Community", "Other"]);
const EVENT_IMAGE_TYPES = new Set(["Auto", "Poster", "Cover"]);
const hasText = (value) => typeof value === "string" && value.trim() !== "";
const validSlug = (value) => hasText(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

function validRawBlog(entry) {
  const fields = entry?.fields || {};
  return hasText(fields.title)
    && fields.title.length <= 120
    && validSlug(fields.slug)
    && hasText(fields.excerpt)
    && fields.excerpt.length <= 240
    && richTextToBlocks(fields.body).length > 0
    && hasText(assetUrl(fields.coverImage))
    && hasText(fields.authorName)
    && BLOG_CATEGORIES.has(fields.category)
    && validDate(fields.publishedAt || entry?.sys?.publishedAt)
    && Number.isInteger(fields.readTimeMinutes)
    && fields.readTimeMinutes >= 1
    && fields.readTimeMinutes <= 60;
}

function validRawEvent(entry) {
  const fields = entry?.fields || {};
  const validEnd = fields.endsAt === undefined || fields.endsAt === null || fields.endsAt === ""
    || (validDate(fields.endsAt) && new Date(fields.endsAt) >= new Date(fields.startsAt));
  const validDeadline = fields.registrationDeadline === undefined || fields.registrationDeadline === null || fields.registrationDeadline === "" || validDate(fields.registrationDeadline);
  return hasText(fields.title)
    && fields.title.length <= 120
    && validSlug(fields.slug)
    && hasText(fields.excerpt)
    && fields.excerpt.length <= 240
    && richTextToBlocks(fields.description).length > 0
    && (hasText(assetUrl(fields.posterImage)) || hasText(assetUrl(fields.coverImage)))
    && (fields.displayImageType === undefined || fields.displayImageType === null || fields.displayImageType === "" || EVENT_IMAGE_TYPES.has(fields.displayImageType))
    && EVENT_CATEGORIES.has(fields.category)
    && validDate(fields.startsAt)
    && validEnd
    && hasText(fields.timezone)
    && hasText(fields.venueName)
    && hasText(fields.town)
    && hasText(fields.county)
    && hasText(fields.organizerName)
    && typeof fields.priceKes === "number"
    && Number.isFinite(fields.priceKes)
    && fields.priceKes >= 0
    && validDeadline;
}

export function normalizeBlogPost(entry) {
  const fields = entry?.fields || entry || {};
  return {
    id: entry?.sys?.id || fields.slug,
    title: fields.title || "Untitled",
    slug: fields.slug || "",
    excerpt: fields.excerpt || "",
    body: richTextToBlocks(fields.body),
    coverImage: assetUrl(fields.coverImage),
    authorName: fields.authorName || "FitLink",
    authorPhoto: assetUrl(fields.authorPhoto),
    category: fields.category || "Company News",
    publishedAt: validDate(fields.publishedAt || entry?.sys?.publishedAt) ? (fields.publishedAt || entry?.sys?.publishedAt) : "",
    readTimeMinutes: Number(fields.readTimeMinutes) || 1,
    featured: Boolean(fields.featured),
    seoTitle: fields.seoTitle || fields.title || "",
    seoDescription: fields.seoDescription || fields.excerpt || "",
    tags: Array.isArray(fields.tags) ? fields.tags : [],
  };
}

export function normalizeEvent(entry) {
  const fields = entry?.fields || entry || {};
  const startsAt = validDate(fields.startsAt) ? fields.startsAt : "";
  const rawEndsAt = fields.endsAt || "";
  const endsAt = validDate(rawEndsAt) && validDate(startsAt) && new Date(rawEndsAt) >= new Date(startsAt) ? rawEndsAt : "";
  const registrationDeadline = validDate(fields.registrationDeadline) ? fields.registrationDeadline : "";
  const gallery = (Array.isArray(fields.gallery) ? fields.gallery : []).slice(0, 8).map(assetUrl).filter(Boolean);
  const priceKes = Math.max(0, Number(fields.priceKes) || 0);
  const coordinates = fields.coordinates && Number.isFinite(fields.coordinates.lat) && Number.isFinite(fields.coordinates.lon)
    ? { lat: fields.coordinates.lat, lon: fields.coordinates.lon }
    : null;
  return {
    id: entry?.sys?.id || fields.slug,
    title: fields.title || "Untitled event",
    slug: fields.slug || "",
    excerpt: fields.excerpt || "",
    description: richTextToBlocks(fields.description),
    coverImage: assetUrl(fields.coverImage),
    posterImage: assetUrl(fields.posterImage),
    displayImageType: EVENT_IMAGE_TYPES.has(fields.displayImageType) ? fields.displayImageType : "Auto",
    gallery,
    category: fields.category || "Other",
    startsAt,
    endsAt,
    timezone: fields.timezone || "Africa/Nairobi",
    venueName: fields.venueName || "Venue to be confirmed",
    address: fields.address || "",
    town: fields.town || "",
    county: fields.county || "",
    coordinates,
    mapUrl: fields.mapUrl || "",
    organizerName: fields.organizerName || "FitLink",
    organizerContact: fields.organizerContact || "",
    priceKes,
    capacity: Number(fields.capacity) > 0 ? Number(fields.capacity) : null,
    registrationUrl: fields.registrationUrl || "",
    registrationDeadline,
    relatedProviderId: fields.relatedProviderId || "",
    featured: Boolean(fields.featured),
    cancelled: Boolean(fields.cancelled),
    activities: Array.isArray(fields.activities) ? fields.activities.filter(hasText) : [],
    pricingOptions: Array.isArray(fields.pricingOptions) ? fields.pricingOptions.filter(hasText) : [],
    registrationNote: fields.registrationNote || "",
  };
}

export function selectEventImage(event = {}) {
  const requested = EVENT_IMAGE_TYPES.has(event.displayImageType) ? event.displayImageType : "Auto";
  if (requested === "Cover" && event.coverImage) return { src: event.coverImage, type: "cover" };
  if (requested === "Poster" && event.posterImage) return { src: event.posterImage, type: "poster" };
  if (requested === "Cover" && event.posterImage) return { src: event.posterImage, type: "poster" };
  if (requested === "Poster" && event.coverImage) return { src: event.coverImage, type: "cover" };
  if (event.posterImage) return { src: event.posterImage, type: "poster" };
  if (event.coverImage) return { src: event.coverImage, type: "cover" };
  return { src: "", type: "none" };
}

function createAssetMap(includes = {}) {
  return new Map((includes.Asset || []).map((asset) => [asset.sys.id, asset]));
}

function resolveAssets(entry, assets) {
  const resolve = (value) => value?.sys?.type === "Link" && value.sys.linkType === "Asset" ? assets.get(value.sys.id) : value;
  const fields = Object.fromEntries(Object.entries(entry.fields || {}).map(([key, value]) => [key, Array.isArray(value) ? value.map(resolve) : resolve(value)]));
  return { ...entry, fields };
}

export function createContentRepository({ env = defaultEnv, fetchImpl = globalThis.fetch, fallbackPosts = localPosts, fallbackEvents = localEvents, now = () => new Date() } = {}) {
  const config = contentfulConfig(env);
  const currentTime = () => {
    const value = typeof now === "function" ? now() : now;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isFinite(date.getTime()) ? date : new Date();
  };
  const upcoming = (items, date = currentTime()) => items
    .filter((event) => validDate(event.startsAt) && new Date(event.startsAt).getTime() >= date.getTime())
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  async function request(contentType, query = {}) {
    if (!config.configured || typeof fetchImpl !== "function") throw new Error("Contentful is not configured");
    const params = new URLSearchParams({ content_type: contentType, locale: config.locale, include: "2", ...query });
    const url = `https://cdn.contentful.com/spaces/${encodeURIComponent(config.spaceId)}/environments/${encodeURIComponent(config.environment)}/entries?${params}`;
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${config.token}` } });
    if (!response.ok) throw new Error(`Contentful request failed (${response.status})`);
    const payload = await response.json();
    if (!Array.isArray(payload.items)) throw new Error("Contentful response has no items");
    const assets = createAssetMap(payload.includes);
    return payload.items.map((entry) => resolveAssets(entry, assets));
  }
  return {
    configured: config.configured,
    async getBlogPosts() {
      if (!config.configured) return { items: fallbackPosts, source: "local", error: null };
      try {
        const entries = await request("blogPost", { order: "-fields.featured,-fields.publishedAt" });
        if (!entries.length) return { items: fallbackPosts, source: "local", error: null };
        if (entries.some((entry) => !validRawBlog(entry))) throw new Error("Contentful blog schema is incomplete");
        return { items: entries.map(normalizeBlogPost), source: "cms", error: null };
      }
      catch (error) { return { items: fallbackPosts, source: "local", error: error.message }; }
    },
    async getBlogPost(slug) {
      const fallback = fallbackPosts.find((post) => post.slug === slug) || null;
      if (!config.configured) return { item: fallback, source: "local", error: null };
      try {
        const [entry] = await request("blogPost", { "fields.slug": slug, limit: "1" });
        if (entry && !validRawBlog(entry)) throw new Error("Contentful blog schema is incomplete");
        if (entry) return { item: normalizeBlogPost(entry), source: "cms", error: null };
        return { item: fallback, source: fallback ? "local" : "cms", error: null };
      } catch (error) { return { item: fallback, source: "local", error: error.message }; }
    },
    async getEvents() {
      const date = currentTime();
      const localUpcoming = upcoming(fallbackEvents, date);
      if (!config.configured) return { items: localUpcoming, source: "local", error: null };
      try {
        const entries = await request("event", { order: "fields.startsAt", "fields.startsAt[gte]": date.toISOString() });
        if (entries.some((entry) => !validRawEvent(entry))) throw new Error("Contentful event schema is incomplete");
        return { items: upcoming(entries.map(normalizeEvent), date), source: "cms", error: null };
      }
      catch (error) { return { items: localUpcoming, source: "local", error: error.message }; }
    },
    async getEvent(slug) {
      const fallback = fallbackEvents.find((event) => event.slug === slug) || null;
      if (!config.configured) return { item: fallback, source: "local", error: null };
      try {
        const [entry] = await request("event", { "fields.slug": slug, limit: "1" });
        if (entry && !validRawEvent(entry)) throw new Error("Contentful event schema is incomplete");
        if (entry) return { item: normalizeEvent(entry), source: "cms", error: null };
        return { item: fallback, source: fallback ? "local" : "cms", error: null };
      } catch (error) { return { item: fallback, source: "local", error: error.message }; }
    },
  };
}

const repository = createContentRepository();
export const getBlogPosts = () => repository.getBlogPosts();
export const getBlogPost = (slug) => repository.getBlogPost(slug);
export const getEvents = () => repository.getEvents();
export const getEvent = (slug) => repository.getEvent(slug);
