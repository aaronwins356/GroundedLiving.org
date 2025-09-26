export default function tailwindcss() {
  return {
    postcssPlugin: "tailwindcss-stub",
    Once(root) {
      root.walkAtRules("tailwind", (atRule) => {
        atRule.remove();
      });
    },
  };
}

tailwindcss.postcss = true;
