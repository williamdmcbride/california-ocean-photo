// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { loadAllPhotos } from "./utils/autoPhotos";

const slugify = (s = "") =>
  s.trim().toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const titleize = (slug = "") =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function useRotator(count, ms = 3000) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!count || count < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms]);
  return [i, setI];
}

function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
}

const BRAND = {
  name: "California Ocean Photography",
  email: "californiaoceanphotography@gmail.com",
  location: "Altadena, CA",
  phone: "626-760-6971",
};

function FooterLegal() {
  return (
    <footer className="border-t border-white/10 py-10 text-sm text-white/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
        <div className="flex items-center gap-5">
          <Link className="hover:text-white" to="/about">About</Link>
          <Link className="hover:text-white" to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}

function OverlayNav() {
  return (
    <nav className="pointer-events-auto flex items-center gap-6 text-xs uppercase tracking-[0.22em] text-white/90">
      <Link to="/" className="hover:text-white">Home</Link>
      <a href="/#portfolio" className="hover:text-white">Portfolio</a>
      <Link to="/about" className="hovr:text-white">About</Link>
      <a href="/#contact" className="hover:text-white">Contact</a>
    </nav>
  );
}

function LogoMark() {
  return (
    <Link to="/" className="pointer-events-auto flex items-center gap-3 text-white">
      <img
        src="/logo.svg"
        alt={BRAND.name}
        className="h-8 w-auto"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    </Link>
  );
}

function Hero({ slides = [], title, subtitle }) {
  const cleanSlides = slides.filter(Boolean);
  const [idx] = useRotator(cleanSlides.length, 3000);
  const active = cleanSlides[idx];
  return (
    <section className="relative isolate h-[86vh] min-h-[560px] w-full overflow-hidden bg-black">
      <AnimatePresence initial={false} mode="wait">
        {active ? (
          <motion.img
            key={active.src}
            src={active.src}
            alt={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        ) : null}
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/55" />
      <div className="pointer-events-none absolute inset-0">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-7">
          <LogoMark />
          <OverlayNav />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="mx-auto w-full max-w-7xl px-6 pb-12">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">{title}</h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Lightbox({ items, startIndex, onClose }) {
  const [i, setI] = useState(startIndex);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((n) => (n + 1) % items.length);
      if (e.key === "ArrowLeft") setI((n) => (n - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, onClose]);
  const active = items[i];
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <img src={active.src} alt={active.name || ""} className="max-h-[82vh] w-full rounded-2xl object-contain shadow-2xl" />
        <div className="mt-4 flex items-center justify-between text-xs text-white/70">
          <button className="rounded-full border border-white/20 px-4 py-2 hover:border-white/40 hover:text-white" onClick={() => setI((n) => (n - 1 + items.length) % items.length)}>Prev</button>
          <div className="truncate px-4">{active.name || ""}</div>
          <button className="rounded-full border border-white/20 px-4 py-2 hover:border-white/40 hover:text-white" onClick={() => setI((n) => (n + 1) % items.length)}>Next</button>
        </div>
        <button className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-black hover:bg-white" onClick={onClose} aria-label="Close lightbox">Close</button>
      </div>
    </div>
  );
}

function Home() {
  const all = useMemo(() => loadAllPhotos(), []);
  const heroSlides = useMemo(() => {
    const hero = all.filter((p) => (p.folder || "").toLowerCase() === "hero");
    return (hero.length ? hero : all).slice(0, 6);
  }, [all]);
  const subjects = useMemo(() => {
    const map = new Map();
    for (const p of all) {
      const folder = (p.folder || "Photos").trim();
      if (folder.toLowerCase() === "hero") continue;
      if (!map.has(folder)) map.set(folder, p);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([folder, cover]) => ({ folder, slug: slugify(folder), cover }));
  }, [all]);
  const folderCounts = useMemo(() => {
    const counts = {};
    for (const p of all) {
      const folder = (p.folder || "Photos").trim();
      if (folder.toLowerCase() === "hero") continue;
      counts[folder] = (counts[folder] || 0) + 1;
    }
    return counts;
  }, [all]);
  return (
    <div className="min-h-screen bg-black text-white">
      <Hero slides={heroSlides} title={BRAND.name} subtitle="A simple outlet to practice, improve, and share what I'm seeing. Mama Blue forever." />
      <section id="portfolio" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Portfolio</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/65 sm:text-base">Exploring the California coast, one frame at a time.</p>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Link key={s.slug} to={"/s/" + encodeURIComponent(s.slug)} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm transition hover:border-white/20 hover:bg-white/10">
              <div className="relative h-64 w-full overflow-hidden bg-black">
                <img src={s.cover ? s.cover.src : ""} alt={s.folder} className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  
                  <div className="text-xs text-white/40">{folderCounts[s.folder] || 0} photos</div>
                </div>
                <div className="mt-2 text-lg font-medium text-white">{titleize(s.slug)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-lg font-semibold">Contact</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
            <div>Email: <a className="underline underline-offset-4 hover:text-white" href="mailto:californiaoceanphotography@gmail.com">{BRAND.email}</a></div>
            <div>Phone: {BRAND.phone}</div>
            <div>Location: {BRAND.location}</div>
          </div>
        </div>
      </section>
      <FooterLegal />
    </div>
  );
}

function Subject() {
  const { slug } = useParams();
  const all = useMemo(() => loadAllPhotos(), []);
  const decoded = (slug || "").toLowerCase();
  const photos = useMemo(() => all.filter((p) => slugify(p.folder || "") === decoded), [all, decoded]);
  const heroSlides = useMemo(() => photos.slice(0, 6), [photos]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const title = titleize(slug || "");
  return (
    <div className="min-h-screen bg-black text-white">
      <Hero slides={heroSlides} title={title} subtitle={null} />
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/50 hover:text-white transition">
            ← Back to Portfolio
          </Link>
        </div>
        {!photos.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">No images found for this folder yet.</div>
        ) : (
          <div className="columns-1 gap-6 sm:lumns-2 lg:columns-3">
            {photos.map((p, i) => (
              <button key={p.src} className="mb-6 w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-sm transition hover:border-white/20 hover:bg-white/10" onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}>
                <img src={p.src} alt={p.name || title} className="w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </section>
      {lightboxOpen ? <Lightbox items={photos} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} /> : null}
      <FooterLegal />
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 flex items-center justify-between">
          <Link className="text-xs uppercase tracking-[0.22em] text-white/75 hover:text-white" to="/">Home</Link>
          <OverlayNav />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About</h1>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-start">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img src="/about.jpg" alt="Photographer" className="h-[520px] w-full object-contain bg-black" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div className="p-5 text-xs text-white/50">Tip: put your image at <span className="text-white/70">public/about.jpg</span></div>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-white/80">I'm an amateur photographer with a love of the ocean and the outdoors. I'm learning as I go, building this site from scratch as a simple outlet to practice, improve, and share what I'm seeing.</p>
            <p className="mt-6 text-lg leading-relaxed text-white/80">My first love is the ocean, Mama Blue. Exploring your passion makes you feel alive. Every photo is part of that journey.</p>
            <p className="mt-6 text-lg leading-relaxed text-white/80">I'm also happy to share and exchange knowledge related to the ocean, photography, or building a website with AI.</p>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-white/60">Based in</div>
              <div className="mt-2 text-white">{BRAND.location}</div>
              <div className="mt-6 text-xs uppercase tracking-[0.22em] text-white/60">Contact</div>
              <div className="mt-2"><a className="underline underline-offset-4 hover:text-white" href="mailto:californiaoceanphotography@gmail.com">{BRAND.email}</a></div>
              <div className="mt-2 text-white/80">{BRAND.phone}</div>
            </div>
          </div>
        </div>
      </section>
      <FooterLegal />
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 flex items-center justify-between">
          <Link className="text-xs uppercase tracking-[0.22em] text-white/75 hover:text-white" to="/">Home</Link>
          <OverlayNav />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-white/75">
          <p>{BRAND.name} respects your privacy. We do not sell, rent, or share your personal information with third parties.</p>
          <p>Any information collected through this website, such as via contact email or future forms, is used solely to respond to your inquiry and communicate with you.</p>
          <p>You may request deletion of your information at any time by contacting <a className="underline underline-offset-4 hover:text-white" href="mailto:californiaoceanphotography@gmail.com">{BRAND.email}</a>.</p>
          <p className="pt-4 text-xs text-white/50">Effective date: {new Date().toLocaleDateString()}</p>
        </div>
      </section>
      <FooterLegal />
    </div>
  );
}

export default function App() {
  useScrollToTop();
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/s/:slug" element={<Subject />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
