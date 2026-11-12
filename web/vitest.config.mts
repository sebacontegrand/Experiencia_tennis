import { defineConfig } from "vitest/config";
import { resolve } from "./vitest.shared.mjs";

export default defineConfig({
  resolve,
  test: { environment: "node", include: ["src/**/*.test.ts"], exclude: ["src/**/*.db.test.ts", "node_modules/**"] },
});
