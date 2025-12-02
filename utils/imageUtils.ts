/**
 * Validates if a string is a valid image URL or data URI
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  // Check if it's a data URI
  if (url.startsWith('data:image/')) {
    // Validate data URI format: data:image/[type];base64,[data]
    const dataUriPattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
    return dataUriPattern.test(url);
  }

  // Check if it's a valid HTTP/HTTPS URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Gets a safe image source, returning empty string if invalid
 */
export function getSafeImageSrc(url: string | null | undefined): string {
  if (isValidImageUrl(url)) {
    return url;
  }
  return '';
}

/**
 * Handles image load errors by hiding the broken image
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  target.style.display = 'none';
}

