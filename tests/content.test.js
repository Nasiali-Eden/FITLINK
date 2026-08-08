import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { posts, whatIsFitLinkBody } from "../src/data/blog.js";
import { events, spearFitnessExpoBody } from "../src/data/events.js";
import { contentfulConfig, createContentRepository, normalizeBlogPost, normalizeEvent, richTextToBlocks, selectEventImage } from "../src/lib/content.js";
import { eventDate } from "../src/lib/contentFormat.js";

const asset = (url) => ({ fields: { file: { url } } });
const richText = (text = "Useful body copy") => ({ nodeType: "document", content: [{ nodeType: "paragraph", content: [{ nodeType: "text", value: text }] }] });
const validBlogEntry = () => ({ sys: { id: "post" }, fields: { title: "Valid post", slug: "valid-post", excerpt: "A complete excerpt", body: richText(), coverImage: asset("//images.ctfassets.net/blog.jpg"), authorName: "Author", category: "Company News", publishedAt: "2026-08-06T09:00:00+03:00", readTimeMinutes: 3 } });
const validEventEntry = () => ({ sys: { id: "event" }, fields: { title: "Valid event", slug: "valid-event", excerpt: "A complete event excerpt", description: richText(), coverImage: asset("//images.ctfassets.net/event.jpg"), category: "Community", startsAt: "2026-09-10T08:00:00+03:00", timezone: "Africa/Nairobi", venueName: "FitLink Field", town: "Nairobi", county: "Nairobi", organizerName: "FitLink", priceKes: 0 } });

test("the local founder article is present and exactly 300 words", () => {
  const post = posts.find((item) => item.slug === "what-is-fitlink");
  assert.equal(post.title, "What Is FitLink?");
  assert.equal(post.authorName, "Dennis Mwambu");
  assert.equal(whatIsFitLinkBody.join(" ").split(/\s+/).filter(Boolean).length, 300);
});

test("Contentful blog entries and rich text normalize into stable models", () => {
  const post = normalizeBlogPost({ sys: { id: "p1" }, fields: { title: "T", slug: "t", body: { nodeType: "document", content: [{ nodeType: "paragraph", content: [{ nodeType: "text", value: "First paragraph." }] }] }, coverImage: asset("//images.ctfassets.net/a.jpg"), readTimeMinutes: 4 } });
  assert.deepEqual(post.body, ["First paragraph."]);
  assert.equal(post.coverImage, "https://images.ctfassets.net/a.jpg");
  assert.equal(post.readTimeMinutes, 4);
});

test("rich text recursively extracts headings, inline links and nested list items", () => {
  const document = { nodeType: "document", content: [
    { nodeType: "heading-2", content: [{ nodeType: "text", value: "A useful heading" }] },
    { nodeType: "paragraph", content: [{ nodeType: "text", value: "Read " }, { nodeType: "hyperlink", content: [{ nodeType: "text", value: "the full guide" }] }] },
    { nodeType: "unordered-list", content: [{ nodeType: "list-item", content: [{ nodeType: "paragraph", content: [{ nodeType: "text", value: "First nested point" }] }] }] },
  ] };
  assert.deepEqual(richTextToBlocks(document), ["A useful heading", "Read the full guide", "First nested point"]);
});

test("missing Contentful configuration returns local fallback without fetching", async () => {
  let fetched = false;
  const fallback = [{ slug: "local" }];
  const repository = createContentRepository({ env: {}, fetchImpl: async () => { fetched = true; }, fallbackPosts: fallback, fallbackEvents: [] });
  assert.equal(contentfulConfig({}).configured, false);
  assert.deepEqual(await repository.getBlogPosts(), { items: fallback, source: "local", error: null });
  assert.equal(fetched, false);
});

test("a malformed Contentful response also returns the local blog", async () => {
  const fallback = [{ slug: "local" }];
  const repository = createContentRepository({
    env: { VITE_CONTENTFUL_SPACE_ID: "space", VITE_CONTENTFUL_ENVIRONMENT: "master", VITE_CONTENTFUL_DELIVERY_TOKEN: "delivery" },
    fetchImpl: async () => ({ ok: true, json: async () => ({ items: [{ sys: { id: "bad" }, fields: { title: "Missing required fields" } }] }) }),
    fallbackPosts: fallback,
    fallbackEvents: [],
  });
  const result = await repository.getBlogPosts();
  assert.deepEqual(result.items, fallback);
  assert.equal(result.source, "local");
  assert.match(result.error, /schema/i);
});

test("malformed Contentful dates cannot reach UI formatters", async () => {
  const fallback = [{ slug: "local" }];
  const malformedBlog = { sys: { id: "bad" }, fields: { title: "Bad date", slug: "bad-date", excerpt: "Excerpt", body: { content: [{ nodeType: "paragraph", content: [{ value: "Body" }] }] }, coverImage: asset("//images.ctfassets.net/a.jpg"), authorName: "Author", publishedAt: "not-a-date" } };
  const repository = createContentRepository({
    env: { VITE_CONTENTFUL_SPACE_ID: "space", VITE_CONTENTFUL_ENVIRONMENT: "master", VITE_CONTENTFUL_DELIVERY_TOKEN: "delivery" },
    fetchImpl: async () => ({ ok: true, json: async () => ({ items: [malformedBlog] }) }),
    fallbackPosts: fallback,
    fallbackEvents: [],
  });
  assert.deepEqual((await repository.getBlogPosts()).items, fallback);
  assert.equal(normalizeBlogPost(malformedBlog).publishedAt, "");
  assert.equal(normalizeEvent({ fields: { startsAt: "not-a-date", registrationDeadline: "also-bad" } }).startsAt, "");
  assert.equal(eventDate("not-a-date"), "Date to be confirmed");
});

test("CMS delivery failures report an honest local source", async () => {
  const fallback = [{ slug: "local" }];
  const repository = createContentRepository({
    env: { VITE_CONTENTFUL_SPACE_ID: "space", VITE_CONTENTFUL_ENVIRONMENT: "master", VITE_CONTENTFUL_DELIVERY_TOKEN: "delivery" },
    fetchImpl: async () => ({ ok: false, status: 503 }),
    fallbackPosts: fallback,
    fallbackEvents: [],
  });
  const result = await repository.getBlogPosts();
  assert.equal(result.source, "local");
  assert.deepEqual(result.items, fallback);
  assert.match(result.error, /503/);
});

test("required CMS fields are validated before display defaults", async () => {
  const config = { VITE_CONTENTFUL_SPACE_ID: "space", VITE_CONTENTFUL_ENVIRONMENT: "master", VITE_CONTENTFUL_DELIVERY_TOKEN: "delivery" };
  for (const missing of ["title", "authorName", "category", "readTimeMinutes"]) {
    const entry = validBlogEntry();
    delete entry.fields[missing];
    const repository = createContentRepository({ env: config, fetchImpl: async () => ({ ok: true, json: async () => ({ items: [entry] }) }), fallbackPosts: posts, fallbackEvents: [] });
    assert.equal((await repository.getBlogPosts()).source, "local", `blog ${missing} must fall back`);
  }
  for (const missing of ["title", "venueName", "organizerName", "priceKes", "timezone"]) {
    const entry = validEventEntry();
    delete entry.fields[missing];
    const repository = createContentRepository({ env: config, fetchImpl: async () => ({ ok: true, json: async () => ({ items: [entry] }) }), fallbackPosts: posts, fallbackEvents: [] });
    assert.equal((await repository.getEvents()).source, "local", `event ${missing} must fall back`);
  }
});

test("events normalize dates, Kenya location, price and bounded gallery", () => {
  const event = normalizeEvent({ fields: { slug: "run", startsAt: "2026-09-10T08:00:00+03:00", endsAt: "2026-09-10T07:00:00+03:00", town: "Nairobi", county: "Nairobi", priceKes: -100, gallery: Array.from({ length: 10 }, (_, index) => asset(`//images.ctfassets.net/${index}.jpg`)), coordinates: { lat: -1.286, lon: 36.817 } } });
  assert.equal(event.endsAt, "");
  assert.equal(event.priceKes, 0);
  assert.equal(event.gallery.length, 8);
  assert.equal(event.timezone, "Africa/Nairobi");
  assert.deepEqual(event.coordinates, { lat: -1.286, lon: 36.817 });
});

test("the local S.P.E.A.R expo preserves its supplied content and poster metadata", () => {
  const event = events.find((item) => item.slug === "fit-link-spear-fitness-expo");
  assert.equal(event.title, "FIT LINK S.P.E.A.R Fitness Expo");
  assert.equal(event.startsAt, "2026-09-05T09:00:00+03:00");
  assert.equal(event.posterImage, "/events/fit-link-spear-fitness-expo.png");
  assert.equal(event.coverImage, "");
  assert.equal(event.displayImageType, "Poster");
  assert.equal(event.capacity, 25);
  assert.equal(event.organizerContact, "+254 717 506 729");
  assert.deepEqual(event.description, spearFitnessExpoBody);
  assert.equal(event.description.length, 7);
});

test("poster-only and cover-only Contentful events validate and normalize", async () => {
  const config = { VITE_CONTENTFUL_SPACE_ID: "space", VITE_CONTENTFUL_ENVIRONMENT: "master", VITE_CONTENTFUL_DELIVERY_TOKEN: "delivery" };
  const posterEntry = validEventEntry();
  delete posterEntry.fields.coverImage;
  posterEntry.fields.posterImage = asset("//images.ctfassets.net/poster.png");
  posterEntry.fields.displayImageType = "Poster";
  const posterRepo = createContentRepository({
    env: config,
    now: () => new Date("2026-08-06T00:00:00Z"),
    fetchImpl: async () => ({ ok: true, json: async () => ({ items: [posterEntry] }) }),
    fallbackEvents: [],
  });
  const posterResult = await posterRepo.getEvents();
  assert.equal(posterResult.source, "cms");
  assert.equal(posterResult.items[0].posterImage, "https://images.ctfassets.net/poster.png");
  assert.equal(posterResult.items[0].displayImageType, "Poster");

  const coverEntry = validEventEntry();
  coverEntry.fields.displayImageType = "Cover";
  const coverRepo = createContentRepository({
    env: config,
    now: () => new Date("2026-08-06T00:00:00Z"),
    fetchImpl: async () => ({ ok: true, json: async () => ({ items: [coverEntry] }) }),
    fallbackEvents: [],
  });
  assert.equal((await coverRepo.getEvents()).source, "cms");
});

test("event visual selection respects preference and safely falls back", () => {
  const both = { posterImage: "/poster.png", coverImage: "/cover.jpg" };
  assert.deepEqual(selectEventImage({ ...both, displayImageType: "Auto" }), { src: "/poster.png", type: "poster" });
  assert.deepEqual(selectEventImage({ ...both, displayImageType: "Cover" }), { src: "/cover.jpg", type: "cover" });
  assert.deepEqual(selectEventImage({ posterImage: "", coverImage: "/cover.jpg", displayImageType: "Poster" }), { src: "/cover.jpg", type: "cover" });
  assert.deepEqual(selectEventImage({ posterImage: "/poster.png", coverImage: "", displayImageType: "Cover" }), { src: "/poster.png", type: "poster" });
  assert.deepEqual(selectEventImage({}), { src: "", type: "none" });
});

test("CMS events without either visual are rejected", async () => {
  const entry = validEventEntry();
  delete entry.fields.coverImage;
  const repository = createContentRepository({
    env: { VITE_CONTENTFUL_SPACE_ID: "space", VITE_CONTENTFUL_ENVIRONMENT: "master", VITE_CONTENTFUL_DELIVERY_TOKEN: "delivery" },
    now: () => new Date("2026-08-06T00:00:00Z"),
    fetchImpl: async () => ({ ok: true, json: async () => ({ items: [entry] }) }),
    fallbackEvents: events,
  });
  const result = await repository.getEvents();
  assert.equal(result.source, "local");
  assert.match(result.error, /schema/i);
});

test("event listings filter local fallbacks by injected current time but detail lookup remains available", async () => {
  const past = { ...events[0], id: "past", slug: "past", startsAt: "2025-01-01T09:00:00+03:00" };
  const future = { ...events[0], id: "future", slug: "future", startsAt: "2026-10-01T09:00:00+03:00" };
  const repository = createContentRepository({ env: {}, fallbackEvents: [future, past], now: () => new Date("2026-08-06T00:00:00Z") });
  assert.deepEqual((await repository.getEvents()).items.map((item) => item.slug), ["future"]);
  assert.equal((await repository.getEvent("past")).item.slug, "past");
});

test("homepage hides an empty event result and uses shimmer loading for events and providers", async () => {
  const home = await readFile(new URL("../src/pages/Home.jsx", import.meta.url), "utf8");
  const skeletons = await readFile(new URL("../src/components/LoadingSkeletons.jsx", import.meta.url), "utf8");
  const eventsPage = await readFile(new URL("../src/pages/Events.jsx", import.meta.url), "utf8");
  const eventDetail = await readFile(new URL("../src/pages/EventDetail.jsx", import.meta.url), "utf8");
  assert.match(home, /if \(!events\.length\) return null/);
  assert.match(home, /data-home-events/);
  assert.match(home, /EventFeatureSkeleton/);
  assert.match(home, /ProviderGridSkeleton/);
  assert.match(eventsPage, /EventGridSkeleton/);
  assert.match(eventDetail, /EventDetailSkeleton/);
  assert.match(skeletons, /animate-pulse/);
  assert.doesNotMatch(home, />Loading approved (trainers|gyms|academies)/);
});

test("Contentful event setup documents optional activities, pricing and manual registration guidance", async () => {
  const setup = await readFile(new URL("../CONTENTFUL_SETUP.md", import.meta.url), "utf8");
  assert.match(setup, /`activities` \| Short text, list \| Optional; suggested maximum 20 items/);
  assert.match(setup, /`pricingOptions` \| Short text, list \| Optional; ordered display-ready pricing labels; suggested maximum 10 items/);
  assert.match(setup, /`registrationNote` \| Long text \| Optional; maximum 400 characters; manual reservation or payment guidance when no `registrationUrl` is provided/);
});

test("blog and event public routes are exposed", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /path="\/blog\/:slug"/);
  assert.match(app, /path="\/events"/);
  assert.match(app, /path="\/events\/:slug"/);
});

test("fallback data uses only local images and route pages do not nest main landmarks", async () => {
  const fallbackFiles = ["trainers.js", "gyms.js", "academies.js", "wellness.js", "stories.js", "blog.js", "events.js"];
  for (const file of fallbackFiles) {
    const source = await readFile(new URL(`../src/data/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /https?:\/\/(images\.)?(unsplash|pexels|pixabay)\./i);
  }
  for (const file of ["Blog.jsx", "BlogPost.jsx", "Events.jsx", "EventDetail.jsx"]) {
    const source = await readFile(new URL(`../src/pages/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /<main\b/);
  }
});
