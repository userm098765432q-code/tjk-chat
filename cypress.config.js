const { defineConfig } = require("cypress");
const { serve } = require("./scripts/serve.cjs");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:8080",
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.js",
    video: false,
    setupNodeEvents(on, config) {
      const server = serve(8080);
      on("after:run", () => server.close());
      return config;
    }
  }
});
