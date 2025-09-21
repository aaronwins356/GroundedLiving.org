import path from "node:path";

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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sanity: path.resolve(process.cwd(), "stubs/sanity/index.ts"),
      "sanity/desk": path.resolve(process.cwd(), "stubs/sanity/desk.ts"),
      "next-sanity/studio": path.resolve(process.cwd(), "stubs/next-sanity/studio.tsx"),
      "html-react-parser": path.resolve(process.cwd(), "stubs/html-react-parser/index.tsx"),
    };

    return config;
  },
};

export default nextConfig;
