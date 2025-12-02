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
    const dataUriPattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/;
    if (!dataUriPattern.test(url)) {
      return false; // Invalid format
    }
    
    // Extract base64 part
    const base64Part = url.substring(url.indexOf(',') + 1);
    
    // Check if base64 part exists and has minimum length
    if (!base64Part || base64Part.length < 10) {
      return false;
    }
    
    // Check if it's likely truncated by database (exactly 255 chars and ends mid-base64)
    // Only reject if it's exactly 255 AND doesn't end with valid base64 padding
    if (url.length === 255) {
      const lastChar = base64Part[base64Part.length - 1];
      // If it doesn't end with valid base64 char, it's likely truncated
      if (!/[A-Za-z0-9+/=]/.test(lastChar)) {
        return false;
      }
      // If it ends with incomplete padding (not = or ==), might be truncated
      // But be lenient - if it ends with valid base64 char, accept it
    }
    
    // Check if base64 part contains only valid base64 characters
    // Allow padding characters (=) at the end
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(base64Part)) {
      return false;
    }
    
    // If we got here, it's a valid data URI
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

