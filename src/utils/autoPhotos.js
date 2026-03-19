// src/utils/autoPhotos.js
// -----------------------------------------------------------------------------
// Auto-load all images inside /src/photos and subfolders using Vite
// Returns: { src, name, folder, path }
// -----------------------------------------------------------------------------

export function loadAllPhotos() {
  const modules = import.meta.glob(
    "../photos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}",
    { eager: true }
  );

  return Object.entries(modules).map(([path, mod]) => {
    const parts = path.split("/");
    const name = parts.pop();     // filename
    const folder = parts.pop();   // parent folder (Alaska, Hero, etc.)

    return {
      src: mod.default,
      name,
      folder,
      path,
    };
  });
}

// Optional helper
export function getPhotosByFolder(folderName) {
  return loadAllPhotos().filter(
    (p) => p.folder.toLowerCase() === folderName.toLowerCase()
  );
}
