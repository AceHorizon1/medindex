import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      loaders: { '.md': ['raw-loader'] }
    }
  },
  env: {
    MEDINDEX_API_URL: process.env.MEDINDEX_API_URL
  }
};

export default nextConfig;
