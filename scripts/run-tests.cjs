const assert = require("node:assert/strict");

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
    jsx: "react-jsx",
    esModuleInterop: true,
    resolveJsonModule: true,
    baseUrl: ".",
    paths: {
      "@/*": ["./*"],
      "@content/*": ["./content/*"],
      "@components/*": ["./components/*"],
      "@/components/*": ["./components/*"],
      "@lib/*": ["./lib/*"],
      "@/lib/*": ["./lib/*"],
      "@project-types/*": ["./types/*"],
    },
    types: ["node"],
  },
});

const { newsletterApiTests } = require("../__tests__/newsletter-api.test.ts");
const { consentBannerTests } = require("../__tests__/consent-banner.test.ts");
const { revalidateApiTests } = require("../__tests__/revalidate-api.test.ts");

const suites = [
  { name: "newsletter-api", cases: newsletterApiTests },
  { name: "consent-banner", cases: consentBannerTests },
  { name: "revalidate-api", cases: revalidateApiTests },
];

(async () => {
  const failures = [];

  for (const suite of suites) {
    for (const testCase of suite.cases) {
      try {
        await testCase.fn();
        console.log(`✓ ${suite.name} › ${testCase.name}`);
      } catch (error) {
        failures.push(`${suite.name} › ${testCase.name}`);
        console.error(`✖ ${suite.name} › ${testCase.name}`);
        console.error(error);
      }
    }
  }

  if (failures.length > 0) {
    assert.fail(`Tests failed:\n${failures.join("\n")}`);
  }

  const total = suites.reduce((acc, suite) => acc + suite.cases.length, 0);
  console.log(`All ${total} tests passed.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
