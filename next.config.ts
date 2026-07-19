import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10gb",
    },
  },
};

export default nextConfig;
