import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pitch form uploads a PDF (up to 5 MB) through a server action; the default limit is 1 MB
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
