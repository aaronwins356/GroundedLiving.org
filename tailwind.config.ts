import type { Config } from "tailwindcss";

import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        bone: "#F8F5F2",
        moss: "#5B7F6B",
        clay: "#C8A98E",
        saffron: "#D9A441",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
    },
  },
  plugins: [typography],
};

export default config;
