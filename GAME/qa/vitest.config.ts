import { defineConfig } from "vite";
export default defineConfig({
  resolve: { alias: { "vite-plus/test": "vitest" } },
  test: { include: ["server/**/*.test.ts", "src/**/*.test.{ts,tsx}", "qa/**/*.test.{ts,tsx}"], environment: "node", pool: "forks", maxWorkers: 1, fileParallelism: false },
});
