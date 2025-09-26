import assert from "node:assert/strict";

import { newsletterApiTests } from "../__tests__/newsletter-api.test";
import { consentBannerTests } from "../__tests__/consent-banner.test";
import { revalidateApiTests } from "../__tests__/revalidate-api.test";

type TestSuite = {
  name: string;
  cases: Array<{ name: string; fn: () => Promise<void> | void }>;
};

const suites: TestSuite[] = [
  { name: "newsletter-api", cases: newsletterApiTests },
  { name: "consent-banner", cases: consentBannerTests },
  { name: "revalidate-api", cases: revalidateApiTests },
];

export async function runSuites() {
  const failures: string[] = [];

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
    const message = failures.join("\n");
    assert.fail(`Tests failed:\n${message}`);
  }

  const total = suites.reduce((acc, suite) => acc + suite.cases.length, 0);
  console.log(`All ${total} tests passed.`);
}

if (require.main === module) {
  runSuites().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
