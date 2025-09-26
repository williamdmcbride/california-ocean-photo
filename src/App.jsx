import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, X as IconClose, ChevronDown } from "lucide-react";
import "@fontsource/playfair-display/600.css";
import { loadPhotos } from "./utils/autoPhotos";

/* ---------- Brand ---------- */
const BRAND = {
  name: "California Ocean Photography",
  email: "californiaoceanphotography@gmail.com",
  phone: "626-760-6971",
  location: "Altadena, CA",
  instagram: "https://instagram.com/yourhandle", // update when ready
};

/* ---------- Shell (no header; footer only) ---------- */
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {children}
      <footer className="border-t border-slate-200 py-10 text-sm dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-slate-500 dark:text-slate-400" style={{ fontFamily: "Playfair Display, serif" }}>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>
          <div className="flex gap-6" style={{ fontFamily: "Playfair Display, serif" }}>
            <Link to="/about" className="hover:underline">About</Link>
            <a href="/#work" className="hover:underline">Portfolio</a>
            <a href="/#contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Home (hero overlay + portfolio + contact) ---------- */
function Home() {
  const ALL = loadPhotos();

  // HERO images from src/photos/HERO; fallback to /public/hero.jpg
  const heroImages = ALL.filter((p) => p.folder === "HERO").map((p) => p.src);
  if (heroImages.length === 0) heroImages.push("/hero.jpg");

  // Rotate every 3s
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 3000);
    return () => clearInterval(id);
  }, [heroImages.length]);

  // Subjects grid (exclude HERO)
  const subjects = useMemo(() => {
    const map = new Map();
    for (const p of ALL) {
      if (p.folder === "HERO") continue;
      if (!map.has(p.folder)) map.set(p.folder, []);
      map.get(p.folder).push(p);
    }
    const pickCover = (arr) => arr.find((x) => /hero|cover/i.test(x.filename)) || arr[0];
    return Array.from(map.entries())
      .map(([folder, items]) => ({
        folder,
        slug: toSlug(folder),
        label: humanize(folder),
        cover: pickCover(items),
        count: items.length,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [ALL]);

  return (
    <>
      {/* HERO with overlay (logo + menu) */}
      <section id="top" className="relative h-[min(92vh,900px)] min-h-[420px] w-full overflow-hidden">
        {/* rotating images */}
        <div className="absolute inset-0">
          {heroImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="Hero"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity: i === heroIndex ? 1 : 0 }}
            />
          ))}
        </div>

        {/* veil */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Overlay content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          {/* LOGO + name */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <img
              src="/logo.svg"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/logo.png"; }}
              alt="Logo"
              className="h-16 w-auto opacity-95"
            />
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl text-white tracking-tight">
              {BRAND.name}
            </h1>
          </div>

          {/* Overlay nav (NO Experience) */}
          <nav
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            style={{ fontFamily: "Playfair Display, serif" }}
            aria-label="Hero navigation"
          >
            <ul className="flex flex-wrap items-center justify-center gap-8 text-white/95 text-lg">
              <li><Link className="hover:opacity-80" to="/about">ABOUT</Link></li>
              <li><a className="hover:opacity-80" href="#work">PORTFOLIO</a></li>
              <li><a className="hover:opacity-80" href="#contact">CONTACT</a></li>
            </ul>
          </nav>

          {/* down chevron */}
          <a
            href="#work"
            aria-label="Scroll to portfolio"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/15 p-2 text-white/90 backdrop-blur hover:bg-white/25"
          >
            <ChevronDown className="h-7 w-7 animate-bounce" />
          </a>
        </div>
      </section>

      {/* PORTFOLIO (Subjects) */}
      <section id="work" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl">Portfolio</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Browse by location or story.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Link
              key={s.slug}
              to={`/s/${s.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg dark:bg-slate-900"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={s.cover?.src}
                  alt={s.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-slate-500">{s.count} photos</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl mb-6">Contact</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5" />
              <a className="hover:underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5" />
              <a href={`tel:${BRAND.phone}`} className="hover:underline">{BRAND.phone}</a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5" /> {BRAND.location}
            </div>
            <div className="flex gap-3 mt-4">
              <a href={BRAND.instagram} className="hover:opacity-70" aria-label="Instagram"><Instagram className="h-6 w-6" /></a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- About Page (/about) ---------- */
function AboutPage() {
  return (
    <main className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Full-viewport hero (no overlay text; shows entire photo) */}
      <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden flex items-center justify-center bg-black">
        <img
          src="/me.jpg"
          alt="California Ocean Photography — William McBride"
          className="max-h-full max-w-full object-contain"
        />
      </section>

      {/* Heading + statement BELOW the photo */}
      <section className="mx-auto w-[min(92vw,1200px)] px-4 py-12 sm:py-16">
        <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl mb-8">About</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-['Playfair_Display'] text-2xl">Artist Statement</h2>
          <p className="mt-4 text-slate-700 dark:text-slate-300">
            I'm learning as I go, building this site from scratch as a simple outlet to practice,
            improve, and share what I'm seeing. Every photo is part of that journey. I'm also happy
            to share and exchange knowledge related to the ocean, photography, or building a website
            with AI.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ---------- Subject Page (/s/:slug) ---------- */
function SubjectPage() {
  const { slug } = useParams();
  const ALL = loadPhotos();

  const groups = ALL.reduce((acc, p) => {
    if (!acc[p.folder]) acc[p.folder] = [];
    acc[p.folder].push(p);
    return acc;
  }, {});
  const folder = Object.keys(groups).find((f) => toSlug(f) === slug);
  const photos = groups[folder] || [];
  const label = humanize(folder || "");

  if (!folder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl">Not Found</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Sorry, we couldn’t find that gallery.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900">Back Home</Link>
      </div>
    );
  }

  const hero = photos.find((p) => /hero|cover/i.test(p.filename)) || photos[0];

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const current = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <>
      {/* Subject hero */}
      <section className="relative h-[60vh] min-h-[380px] w-full overflow-hidden">
        {hero && <img src={hero.src} alt={label} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl text-white">{label}</h1>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {photos.map((p, i) => (
            <button
              key={p.src + i}
              onClick={() => setLightboxIndex(i)}
              className="mb-4 w-full overflow-hidden rounded-2xl bg-slate-50 shadow-sm ring-1 ring-slate-200 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800"
              style={{ breakInside: "avoid" }}
            >
              <img src={p.src} alt={p.alt || p.filename} className="w-full h-auto object-contain" loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {current && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4" onClick={() => setLightboxIndex(null)}>
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={current.alt || current.filename} className="max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl" />
            <button onClick={() => setLightboxIndex(null)} className="absolute -right-3 -top-3 rounded-full bg-white p-2 text-slate-900 shadow" aria-label="Close">
              <IconClose className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- App Routes ---------- */
export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/s/:slug" element={<SubjectPage />} />
        <Route path="*" element={<div className="p-10">Not Found</div>} />
      </Routes>
    </Shell>
  );
}

/* ---------- helpers ---------- */
function humanize(name = "") {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function toSlug(s = "") {
  return humanize(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
