import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile firebase packages for Next.js
  transpilePackages: ['firebase'],

  // Enable React strict mode for better dev experience
  reactStrictMode: true,

  // Images: allow Unsplash + Firebase Storage
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Experimental: optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
