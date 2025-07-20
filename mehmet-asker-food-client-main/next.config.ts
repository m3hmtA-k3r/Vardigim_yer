import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    },
  },
  images: {
    domains: ['images.unsplash.com', 'localhost', 'resmim.net'],
  },
  compress: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://mehmet-asker-food-backend.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
