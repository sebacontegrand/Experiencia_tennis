import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// En Vercel + Neon: DATABASE_URL es la conexión con pool (la usa la app) y
// DATABASE_URL_UNPOOLED la directa, más segura para migraciones. En local solo hace falta DATABASE_URL.
const migrationUrl = process.env.DATABASE_URL_UNPOOLED || env("DATABASE_URL");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationUrl,
  },
});
