import { defineConfig } from "vitest/config";
import path from "path";
export default defineConfig({
  root: path.resolve(import.meta.dirname),
  test: {
    environment: "node",
    include: [
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
      "server/__tests__/**/*.test.ts",
    ],
    exclude: [
      "server/__tests__/fase58.test.ts",
      "server/__tests__/notification-monitor.test.ts",
      "server/__tests__/project-hibernation.test.ts",
      "server/__tests__/projects-enhanced.test.ts",
      "server/__tests__/sse-auth.test.ts",
    ],
    globals: true,
    testTimeout: 30000,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@": path.resolve(import.meta.dirname, "client/src"),
    },
  },
});
