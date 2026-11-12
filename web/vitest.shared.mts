import { fileURLToPath } from "node:url";

export const resolve = {
  alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    // "server-only" lanza fuera de React Server Components; en tests lo neutralizamos.
    "server-only": fileURLToPath(new URL("./src/test/empty.ts", import.meta.url)),
  },
};
