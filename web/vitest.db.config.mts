import { defineConfig } from "vitest/config";
import { resolve } from "./vitest.shared.mjs";

/** Tests contra Postgres real (TEST_DATABASE_URL). Corren en serie: comparten la base. */
export default defineConfig({
  resolve,
  test: {
    environment: "node",
    include: ["src/**/*.db.test.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
    setupFiles: ["./src/test/db-env.ts"],
  },
});
