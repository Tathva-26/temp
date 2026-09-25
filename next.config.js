/** @type {import('next').NextConfig} */

/*
 * Event and venue pictures are uploaded through the backend's POST /api/upload
 * and served from Cloudflare R2, so their host depends on the deployment's
 * R2_PUBLIC_URL. next/image refuses any host not listed here, which shows up
 * as a 400 on the image rather than an obvious misconfiguration — so the CDN
 * host is configurable instead of hard-coded.
 */
const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST || 'cdn.tathva.org';

const nextConfig = {
  experimental: {
    optimizeCss: false, // disable LightningCSS
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: imageHost,
        pathname: '/**',
      },
      {
        // Static images that used to live under public/, now served from this CDN.
        protocol: 'https',
        hostname: 'cdn-next.tathva.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tiqr-events.sgp1.cdn.digitaloceanspaces.com',
        pathname: '/**', // This allows any image path from this host
      },
      {
        // Google profile pictures, from the OAuth sign-in.
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
