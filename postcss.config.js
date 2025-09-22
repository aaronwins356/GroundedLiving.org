/**
 * PostCSS pipeline configured for Tailwind CSS.
 * The Tailwind plugin processes directives while Autoprefixer ensures browser compatibility.
 */
const config = {
  plugins: {
    /** Tailwind PostCSS plugin keeps directives colocated with component styles. */
    tailwindcss: {},
    /** Autoprefixer adds vendor prefixes for the targeted browserslist. */
    autoprefixer: {},
  },
};

export default config;
