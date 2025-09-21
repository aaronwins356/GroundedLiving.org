/**
 * PostCSS pipeline configured for Tailwind CSS v4.
 * The Tailwind plugin processes directives while Autoprefixer ensures browser compatibility.
 */
module.exports = {
  plugins: {
    /** Tailwind v4 PostCSS plugin keeps directives colocated with component styles. */
    '@tailwindcss/postcss': {},
    /** Autoprefixer adds vendor prefixes for the targeted browserslist. */
    autoprefixer: {},
  },
};
