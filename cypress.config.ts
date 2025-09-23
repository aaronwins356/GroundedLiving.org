import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.ts",
    baseUrl: "http://localhost:3000",
  },
});
