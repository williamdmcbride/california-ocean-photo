// src/utils/autoPhotos.js
// -----------------------------------------------------------------------------
// Automatically imports all images inside /src/photos and its subfolders.
// Returns an array of { src, name, folder, path } objects.
// This function works seamlessly with Vite and will auto-refresh when you add
// or remove photos in your photos/ directory.
// -----------------------------------------------------------------------------

export function loadAllPhotos() {
  // import all image files from /src/photos and subfolders
  const images = import.meta.glob("../photos/**/*.{jpg,jpeg,png,webp,avif}", {
    eager: true,
  });

  // transform import.meta.glob results into a clean list
  return Object.entries(images).map(([path, module]) => {
    const parts = path.split("/");
    const name = parts.pop();   // file name (e.g. 087A5705.jpg)
    const folder = parts.pop(); // folder (e.g. Alaska, Malibu, Sunset)

    return {
      src: module.default,
      name,
      folder,
      path,
    };
  });
}

// -----------------------------------------------------------------------------
// Optional helper: get photos by folder
// Example: getPhotosByFolder("Alaska")
// -----------------------------------------------------------------------------
export function getPhotosByFolder(folderName) {
  const allPhotos = loadAllPhotos();
  return allPhotos.filter(
    (photo) => photo.folder.toLowerCase() === folderName.toLowerCase()
  );
}
