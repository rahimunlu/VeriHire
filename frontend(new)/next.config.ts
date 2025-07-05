import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["https://*.cloudworkstations.dev"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  // World Mini App optimizations
  reactStrictMode: true,
  swcMinify: true,
  // Ensure compatibility with World App
  assetPrefix: process.env.NODE_ENV === "production" ? "" : "",
  // Add security headers for World Mini App
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
