import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

/**
 * Tailwind configuration scoped to both legacy folders and the new ./src convention
 * so migrations to the src/ tree are seamless.
 */
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Palette intentionally mirrors the calming neutrals from Healing Soulfully while
         * keeping naming aligned with existing utility classes in the codebase.
         */
        brand: {
          DEFAULT: "#6b9080",
          50: "#f3f6f3",
          100: "#e5efe8",
          200: "#c6ddcf",
          300: "#a5cab6",
          400: "#84b89e",
          500: "#6b9080",
          600: "#4f7364",
          700: "#39574a",
          800: "#2d453b",
          900: "#1f312a",
        },
        accent: {
          DEFAULT: "#2f3e46",
          soft: "#4e5d64",
        },
        cream: "#fdf8f3",
        mist: "#eef2ef",
      },
      fontFamily: {
        sans: [
          "'Work Sans'",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
        serif: [
          "'Fraunces'",
          "'Times New Roman'",
          "serif",
        ],
      },
      boxShadow: {
        soft: "0 20px 45px -35px rgba(74, 78, 105, 0.45)",
      },
      borderRadius: {
        xl: "1.5rem",
      },
    },
  },
  plugins: [
    /** Typography plugin keeps long-form content polished out of the box. */
    typography,
  ],
};

export default config;
