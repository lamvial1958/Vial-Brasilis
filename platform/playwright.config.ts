import { defineConfig, devices } from "@playwright/test";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// Load .env.test.local and .env.local without requiring dotenv as a dep
function loadEnvFile(filepath: string) {
  if (!existsSync(filepath)) return;
  for (const line of readFileSync(filepath, "utf-8").split("\n")) {
    const m = line.trim().match(/^([^#=][^=]*)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim().replace(/^["']|["']$/g, "");
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) process.env[key] = val;
  }
}
loadEnvFile(join(__dirname, ".env.test.local"));
loadEnvFile(join(__dirname, ".env.local"));

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 40_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start the dev server automatically unless an external base URL is given
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "next dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
