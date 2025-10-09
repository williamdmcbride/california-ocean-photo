// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadAllPhotos } from "./utils/autoPhotos";

// --- helpers ---
const toTitle = (s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const useRotator = (count, ms = 3000) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms]);
  return [i, setI];
};

// --- overlay nav used in heroes ---
function OverlayNav() {
  return (
    <nav className="pointer-events-auto flex items-center justify-end gap-6 text-white/90">
      <Link className="hover:opacity-80" to="/">Home</Link>
      <a className="hover:opacity-80" href="/#portfolio">Portfolio</a>
      <Link className="hover:opacity-80" to="/about">About</Link>
      <a className="hover:opacity-80" href="/#contact">Contact</a>
    </nav>
  );
}

// --- HOME ---
function Home() {
  const all = useMemo(() => loadAllPhotos(), []);
  // Prefer a folder named "Hero" or "HERO" if present, else just use the first few photos
  const heroCandidates = useMemo(() => {
    const heroish = all.filter((p) => /^(hero)$/i.test(p.folder || ""));
    const list = (heroish.length ? heroish : all).slice(0, 5);
    return list;
  }, [all]);

  const [idx, setIdx] = useRotator(heroCandidates.length, 3000);

  // Build subject cards: first image per folder
  const subjects = useMemo(() => {
    const map = new Map();
    for (const p of all) {
      const key = (p.folder || "Photos").trim();
      if (!map.has(key)) map.set(key, p);
    }
    // Sort alpha, and drop Hero folder from the cards
    return [...map.entries()]
      .filter(([k]) => !/^(hero)$/i.test(k))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([folder, cover]) => ({
        folder,
        slug: folder.toLowerCase(),
        cover,
      }));
  }, [all]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* HERO with rotating background + overlay nav (no top bar) */}
      <section className="relative isolate h-[80vh] min-h-[520px] w-full overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {heroCandidates.map((img, i) =>
            i === idx ? (
              <motion.img
                key={img.src}
                src={img.src}
                alt="Featured"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null
          )}
        </AnimatePresence>

        {/* readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

        {/* overlay nav + brand */}
        <div className="pointer-events-none absolute inset-0 flex flex-col">
          <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="pointer-events-auto flex items-center justify-between">
              {/* Logo (optional). Put your file at /public/logo.svg or adjust src */}
              <Link to="/" className="flex items-center gap-3 text-white">
                <img
                  src="/logo.svg"
                  alt="California Ocean Photography"
                  className="h-8 w-auto"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </Link>
              <OverlayNav />
            </div>
          </div>

          {/* title block */}
          <div className="relative mx-auto mt-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              California Ocean Photography
            </h1>
          </div>
        </div>
      </section>

      {/* PORTFOLIO (subject cards) */}
      <section id="portfolio" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">Portfolio</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Link
              key={s.slug}
              to={`/s/${encodeURIComponent(s.slug)}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <img
                src={s.cover.src}
                alt={s.folder}
                className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="p-4">
                <div className="text-lg font-medium">{toTitle(s.slug)}</div>
                <div className="text-xs text-slate-500">{s.folder}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CONTACT anchor (simple placeholder so /#contact works) */}
      <section id="contact" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Contact</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            For bookings and inquiries:{" "}
            <a className="underline" href="mailto:californiaoceanphotography@gmail.com">
              californiaoceanphotography@gmail.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

// --- SUBJECT PAGE (rotating hero like home) ---
function Subject() {
  const { slug } = useParams(); // e.g., "alaska"
  const all = useMemo(() => loadAllPhotos(), []);
  const photos = useMemo(
    () => all.filter((p) => (p.folder || "").toLowerCase() === (slug || "").toLowerCase()),
    [all, slug]
  );

  const heroSlides = photos.slice(0, 4);
  const [idx, setIdx] = useRotator(heroSlides.length, 3000);
  const title = toTitle(slug || "");

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="relative isolate h-[70vh] min-h-[420px] w-full overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {(heroSlides.length ? heroSlides : photos.slice(0, 1)).map((img, i) =>
            i === (idx % Math.max(heroSlides.length || 1, 1)) ? (
              <motion.img
                key={img.src}
                src={img.src}
                alt={title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
        <div className="pointer-events-none absolute inset-0 flex flex-col">
          <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="pointer-events-auto flex items-center justify-between">
              <Link to="/" className="text-white hover:opacity-80">
                Home
              </Link>
              <OverlayNav />
            </div>
          </div>
          <div className="relative mx-auto mt-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              {title}
            </h1>
            {heroSlides.length > 1 && (
              <div className="mt-4 flex gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-2 w-2 rounded-full border border-white/70 ${
                      i === idx ? "bg-white" : "bg-white/20"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!photos.length ? (
          <div className="text-slate-500 dark:text-slate-400">
            No images found for <span className="font-medium">{title}</span>.
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {photos.map((p) => (
              <figure
                key={p.src}
                className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800"
              >
                <img
                  src={p.src}
                  alt={p.name || title}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// --- ABOUT (simple page) ---
function About() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          I’m an amateur photographer with a love for the ocean and the outdoors—learning by
          doing, and sharing the journey as I go.
        </p>
      </section>
    </div>
  );
}

// --- APP ROOT ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/s/:slug" element={<Subject />} />
        <Route path="/about" element={<About />} />
        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
