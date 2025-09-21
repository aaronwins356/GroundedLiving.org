import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#a88574",
          50: "#f9f5f1",
          100: "#f3e9e2",
          200: "#e6d3c5",
          300: "#d7bcab",
          400: "#c2a18f",
          500: "#a88574",
          600: "#8b6b5d",
          700: "#705347",
          800: "#4e3830",
          900: "#2f1f1b",
        },
        accent: {
          DEFAULT: "#4a4e69",
          soft: "#6b708d",
        },
        mist: "#f4f7f6",
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
        serif: [
          "'Cormorant Garamond'",
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
  plugins: [typography],
};

export default config;
