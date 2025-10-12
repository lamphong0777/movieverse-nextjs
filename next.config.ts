/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // ✅ Bật App Router
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'phimimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'phimapi.com',
        pathname: '/image.php/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
    formats: ['image/webp'],
  },
  trailingSlash: false,
};

module.exports = nextConfig;
