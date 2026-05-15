/// <reference types="vitest" />

import react from "@vitejs/plugin-react-swc";
import { config } from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// load .env.test
config({
  path: ".env.testing",
});

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    css: true,
    env: {},
    // setupFiles: "./tests/setup.ts",
    reporters: ["verbose"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "test/**",
        "./.next",
        "./components/icons/**",
        "./components/ui/**",
        "./**/__tests__/**",
      ],
    },
  },
});
