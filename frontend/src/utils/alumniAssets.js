// Alumni asset resolver.
// Uses real images from public/alumni/ folder.

/**
 * Resolve an alumni image reference to a usable URL.
 * Supports:
 * - full http(s) urls
 * - "/alumni/filename.ext" (direct path to public/alumni/)
 * - "/assets/filename.ext" (direct path to public/assets/)
 * - any string containing a filename at the end
 * 
 * Falls back to UI Avatar service if image not found
 */
export function resolveAlumniImage(imagePath, fallbackName = 'Alumni') {
  // Handle undefined, null, or empty string
  if (!imagePath || imagePath === "") {
    // Return placeholder avatar with name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&color=fff&size=300`;
  }

  const raw = String(imagePath);
  
  // Handle full URLs
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  // If it's already a path starting with /alumni/ or /assets/, return it directly
  if (raw.startsWith("/alumni/") || raw.startsWith("/assets/")) {
    return raw;
  }

  // Extract filename from any path format
  const filename = raw.split("/").pop();
  if (!filename) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&color=fff&size=300`;
  }

  // Construct path to public/alumni/
  return `/alumni/${filename}`;
}

