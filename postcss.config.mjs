/**
 * PostCSS configuration compatible with Tailwind CSS v4's dedicated PostCSS plugin.
 * The plugin is resolved via its package name so Next.js can validate the shape.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};

export default config;
