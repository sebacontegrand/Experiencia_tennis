import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

/**
 * Lecturas públicas cacheadas (Cache Components). El admin invalida con updateTag(...)
 * al editar: "formats", "experiences", "partners".
 */

export async function getFormats() {
  "use cache";
  cacheLife("hours");
  cacheTag("formats");
  return db.experienceFormat.findMany({ orderBy: { sortOrder: "asc" } });
}

/** Próximas experiencias visibles (publicadas o con cupo completo), de la más cercana a la más lejana. */
export async function getUpcomingExperiences(limit = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag("experiences");
  // Corte por fecha de fin a medianoche UTC del día: estable dentro del período de caché.
  const today = new Date(new Date().toISOString().slice(0, 10));
  return db.experience.findMany({
    where: { status: { in: ["PUBLICADA", "CUPO_COMPLETO"] }, endDate: { gte: today } },
    orderBy: { startDate: "asc" },
    take: limit,
    select: {
      slug: true,
      title: true,
      status: true,
      startDate: true,
      endDate: true,
      destination: true,
      capacity: true,
      summary: true,
      format: { select: { name: true, slug: true } },
    },
  });
}

export async function getPublicPartners() {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");
  return db.partner.findMany({
    where: { isPublic: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, logo: true, website: true, type: true },
  });
}
