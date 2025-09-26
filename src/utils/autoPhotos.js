// Auto-load images from src/photos/** with Vite literal glob
function titleFromFilename(name = "") {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
}

/**
 * Load photos from src/photos/**
 * Returns: { src, title, category, folder, alt, filename, path }
 */
export function loadPhotos() {
  // LITERAL string only (required by Vite)
  const modules = import.meta.glob(
    "../photos/**/*.{jpg,jpeg,JPG,JPEG,png,webp,avif}",
    { eager: true }
  );

  return Object.entries(modules).map(([path, mod]) => {
    const url = mod?.default || mod;
    const parts = path.split("/"); // ["..","photos","Folder","file.jpg"]
    const folder = parts[2] || "Misc";
    const filename = parts[parts.length - 1] || "";
    const title = titleFromFilename(filename);

    return {
      src: url,
      title,
      category: folder,
      folder,
      alt: title,
      filename,
      path,
    };
  });
}
