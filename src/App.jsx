// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadAllPhotos } from "./utils/autoPhotos";

// ----------------- utils -----------------
const toTitle = (s = "") => s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const useRotator = (count, ms = 3000) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setI(n => (n + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms]);
  return [i, setI];
};

// Overlay nav that sits inside heroes (no top bar elsewhere)
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

// ----------------- Home -----------------
function Home() {
  const all = useMemo(() => loadAllPhotos(), []);
  // Prefer images from a folder named "Hero"/"HERO" if present, else first few photos
  const heroSlides = useMemo(() => {
    const heroish = all.filter(p => /^(hero)$/i.test(p.folder || ""));
    return (heroish.length ? heroish : all).slice(0, 5);
  }, [all]);
  const [idx] = useRotator(heroSlides.length, 3000);

  // Build subject cards (first image per folder), exclude Hero
  const subjects = useMemo(() => {
    const map = new Map();
    for (const p of all) {
      const folder = (p.folder || "Photos").trim();
      if (!/^(hero)$/i.test(folder) && !map.has(folder)) map.set(folder, p);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([folder, cover]) => ({ folder, slug: folder.toLowerCase(), cover }));
  }, [all]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* HERO */}
      <section className="relative isolate h-[80vh] min-h-[520px] w-full overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {heroSlides.map((img, i) =>
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

        {/* overlay nav + brand */}
        <div className="pointer-events-none absolute inset-0 flex flex-col">
          <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="pointer-events-auto flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 text-white">
                {/* Put your logo at /public/logo.svg (or change src) */}
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

          <div className="relative mx-auto mt-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              California Ocean Photography
            </h1>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
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

      {/* CONTACT anchor target */}
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

// ----------------- Subject Page -----------------
function Subject() {
  const { slug } = useParams(); // e.g. "alaska"
  const all = useMemo(() => loadAllPhotos(), []);
  const photos = useMemo(
    () => all.filter(p => (p.folder || "").toLowerCase() === (slug || "").toLowerCase()),
    [all, slug]
  );

  const hero = photos.slice(0, 4);
  const [idx, setIdx] = useRotator(hero.length, 3000);
  const title = toTitle(slug || "");

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* HERO */}
      <section className="relative isolate h-[70vh] min-h-[420px] w-full overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {(hero.length ? hero : photos.slice(0, 1)).map((img, i) =>
            i === (idx % Math.max(hero.length || 1, 1)) ? (
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
              <Link to="/" className="text-white hover:opacity-80">Home</Link>
              <OverlayNav />
            </div>
          </div>
          <div className="relative mx-auto mt-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              {title}
            </h1>
            {hero.length > 1 && (
              <div className="mt-4 flex gap-2">
                {hero.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-2 w-2 rounded-full border border-white/70 ${i === idx ? "bg-white" : "bg-white/20"}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GRID */}
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

// ----------------- About -----------------
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

// ----------------- App Root (NO BrowserRouter here) -----------------
export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/s/:slug" element={<Subject />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
