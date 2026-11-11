import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { exceedsLimit, type RateLimitOptions } from "@/lib/spam-rules";

export { FORM_RATE_LIMIT, isHoneypotFilled } from "@/lib/spam-rules";

export async function clientIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.RATE_LIMIT_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Límite de envíos por formulario e IP (hash), guardado en Postgres: sirve en serverless sin Redis.
 * Devuelve true si el envío está permitido y lo registra.
 */
export async function checkRateLimit(form: string, options: RateLimitOptions) {
  const key = `${form}:${await clientIpHash()}`;
  const since = new Date(Date.now() - options.windowMs);

  const previous = await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (exceedsLimit(previous, options)) return false;

  await db.rateLimitHit.create({ data: { key } });
  // Limpieza oportunista de registros de más de un día
  if (Math.random() < 0.05) {
    await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 86_400_000) } } });
  }
  return true;
}
