const WEBP_PREFIX = 'https://phimapi.com/image.php?url='

export const convertToWebP = (url?: string | null): string => {
  if (!url) return 'https://placehold.co/200x300?text=No+Image'

  if (url.includes('image.php')) return url

  const absoluteUrl = url.startsWith('http')
    ? url
    : `https://phimimg.com/${url.replace(/^\/+/, '')}`

  return WEBP_PREFIX + encodeURIComponent(absoluteUrl)
}
