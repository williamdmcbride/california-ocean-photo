import React from "react";
import { useParams, Link } from "react-router-dom";
import { loadPhotos } from "../utils/autoPhotos";
import "@fontsource/playfair-display/600.css";

export default function Subject() {
  const { slug } = useParams();
  const all = loadPhotos();

  // group photos by folder
  const grouped = all.reduce((acc, p) => {
    if (!acc[p.folder]) acc[p.folder] = [];
    acc[p.folder].push(p);
    return acc;
  }, {});

  const folder = Object.keys(grouped).find((key) => toSlug(key) === slug);
  const photos = grouped[folder] || [];

  if (!folder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl">Not Found</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Sorry, we couldn’t find that gallery.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const hero = photos.find((p) => /hero|cover/i.test(p.filename)) || photos[0];

  return (
    <div>
      {/* HERO IMAGE */}
      {hero && (
        <section className="relative h-[70vh] min-h-[400px] w-full overflow-hidden">
          <img
            src={hero.src}
            alt={hero.alt || folder}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
            <h1 className="font-['Playfair_Display'] text-5xl sm:text-6xl text-white drop-shadow">
              {humanize(folder)}
            </h1>
          </div>
        </section>
      )}

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg dark:bg-slate-900"
            >
              <img
                src={p.src}
                alt={p.alt || p.filename}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const humanize = (name = "") =>
  name
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const toSlug = (s = "") =>
  humanize(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
