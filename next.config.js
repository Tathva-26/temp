/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false, // disable LightningCSS
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API;
    if (!api) return [];
    return [
      {
        source: "/api/auth/:path*",
        destination: `${api.replace(/\/$/, "")}/api/auth/:path*`,
      },
    ];
  },
  images: {
      remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tiqr-events.sgp1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**', // This allows any image path from this host
      },
    ],
    domains: ['lh3.googleusercontent.com'], // add other domains if needed
  },
};

module.exports = nextConfig;
