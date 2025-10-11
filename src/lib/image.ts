export const convertToWebP = (url: string | undefined | null): string => {
  // Fallback to placeholder if URL is invalid or missing
  if (!url || typeof url !== 'string') {
    return 'https://placehold.co/200x300?text=No+Image';
  }

  // If URL already contains 'image.php', assume it's already processed
  if (url.includes('image.php')) {
    return url;
  }

  // Ensure the URL is absolute by prepending the CDN domain if needed
  const absoluteUrl = url.startsWith('http') ? url : `https://phimimg.com/${url.replace(/^\/+/, '')}`;

  // Construct WebP URL using the API endpoint
  return `https://phimapi.com/image.php?url=${encodeURIComponent(absoluteUrl)}`;
};
