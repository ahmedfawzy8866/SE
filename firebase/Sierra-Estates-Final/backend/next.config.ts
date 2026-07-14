import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Backend-only: no pages, no frontend components
  // All routes live under src/app/api/
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
