const { defineConfig } = require("cypress");
const { serve } = require("./scripts/serve.cjs");

// Порти пешфарз 8080; агар машғул бошад (масалан, preview кор мекунад):
// E2E_PORT=8081 npm run e2e
const PORT = Number(process.env.E2E_PORT) || 8080;

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:${PORT}`,
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.js",
    video: false,
    setupNodeEvents(on, config) {
      const server = serve(PORT);
      on("after:run", () => server.close());
      return config;
    }
  }
});
