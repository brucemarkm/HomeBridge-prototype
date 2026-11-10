import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: process.env.HB_TEST_BASE_URL || "http://127.0.0.1:3100",
    headless: true,
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: process.env.HB_TEST_BASE_URL || "http://127.0.0.1:3100",
    reuseExistingServer: true,
    timeout: 120000,
  },
  reporter: "list",
});
