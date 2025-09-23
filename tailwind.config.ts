import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fdfaf5",
          100: "#f7f0e4",
          200: "#efe3cf",
        },
        sage: {
          100: "#f1f5f2",
          200: "#dbe7df",
          300: "#b8d0c2",
          400: "#92b8a5",
          500: "#6c9f88",
        },
        rose: {
          100: "#f9ecec",
          200: "#f1d5d5",
          300: "#e3b5b7",
        },
        taupe: {
          200: "#d9cbc0",
          300: "#c7b4a1",
          400: "#a99280",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        glow: "0 20px 45px -20px rgba(108, 159, 136, 0.45)",
      },
      backgroundImage: {
        "soft-gradient": "linear-gradient(135deg, rgba(242,236,229,0.95) 0%, rgba(230,217,207,0.85) 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
