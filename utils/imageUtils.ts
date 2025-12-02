/**
 * Validates if a string is a valid image URL or data URI
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  // Check if it's a data URI
  if (url.startsWith('data:image/')) {
    // Check if it looks truncated (base64 data URIs are typically much longer)
    // If it's less than 100 chars after the prefix, it's likely truncated
    const base64Part = url.substring(url.indexOf(',') + 1);
    if (base64Part.length < 50) {
      return false; // Too short, likely truncated
    }
    
    // Check if it ends abruptly (doesn't end with = or valid base64 char)
    // Truncated base64 strings often end mid-character
    const lastChar = base64Part[base64Part.length - 1];
    if (!/[A-Za-z0-9+/=]/.test(lastChar)) {
      return false; // Invalid ending character
    }
    
    // Validate data URI format: data:image/[type];base64,[data]
    // Use a more lenient pattern that allows incomplete base64 (for truncated strings)
    const dataUriPattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/;
    if (!dataUriPattern.test(url)) {
      return false; // Invalid format
    }
    
    // If it's exactly 255 characters or close to it, it's likely truncated by the database
    if (url.length >= 250 && url.length <= 255) {
      return false; // Likely truncated by database VARCHAR(255) limit
    }
    
    // Check if base64 part is valid (at least the structure)
    const base64Data = url.split(',')[1];
    if (!base64Data || base64Data.length < 10) {
      return false;
    }
    
    // Only accept if it looks complete (ends with = or has reasonable length)
    // Base64 strings should be multiples of 4, but we'll be lenient
    return true;
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

