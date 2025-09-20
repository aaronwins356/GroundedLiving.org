import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "next-sanity": path.resolve(projectDir, "stubs/next-sanity"),
      "next-sanity/studio": path.resolve(projectDir, "stubs/next-sanity-studio"),
      "@sanity/image-url": path.resolve(projectDir, "stubs/sanity-image-url"),
      sanity: path.resolve(projectDir, "stubs/sanity"),
      "sanity/desk": path.resolve(projectDir, "stubs/sanity-desk"),
    };

    return config;
  },
};

export default nextConfig;
