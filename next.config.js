import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveOptionalModule(moduleId) {
  try {
    require.resolve(moduleId);
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

const optionalAliases = {};

if (resolveOptionalModule("next-sanity")) {
  optionalAliases["next-sanity"] = path.join(__dirname, "stubs/next-sanity.ts");
  optionalAliases["next-sanity/studio"] = path.join(
    __dirname,
    "stubs/next-sanity-studio.tsx",
  );
}

if (resolveOptionalModule("@sanity/image-url")) {
  optionalAliases["@sanity/image-url"] = path.join(
    __dirname,
    "stubs/sanity-image-url.ts",
  );
}

if (resolveOptionalModule("sanity")) {
  optionalAliases.sanity = path.join(__dirname, "stubs/sanity.ts");
}

if (resolveOptionalModule("sanity/desk")) {
  optionalAliases["sanity/desk"] = path.join(__dirname, "stubs/sanity-desk.ts");
}

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
      ...optionalAliases,
    };
    return config;
  },
};

export default nextConfig;
