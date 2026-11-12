import "server-only";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { SEAT_HOLDING_STATUSES, VISIBLE_EXPERIENCE_STATUSES, registrationClosedReason } from "@/lib/registration-rules";

/**
 * Lecturas públicas cacheadas (Cache Components). Al mutar se invalida con updateTag(...):
 * "formats", "experiences" (listados), `experience:<slug>` (detalle y cupos), "partners".
 */

export const experienceTag = (slug: string) => `experience:${slug}`;

/** Medianoche UTC de hoy: estable dentro del período de caché. */
function today() {
  return new Date(new Date().toISOString().slice(0, 10));
}

export async function getFormats() {
  "use cache";
  cacheLife("hours");
  cacheTag("formats");
  return db.experienceFormat.findMany({ orderBy: { sortOrder: "asc" } });
}

const cardSelect = {
  slug: true,
  title: true,
  status: true,
  startDate: true,
  endDate: true,
  destination: true,
  capacity: true,
  summary: true,
  coverImage: true,
  format: { select: { name: true, slug: true } },
} as const;

/** Próximas experiencias abiertas (publicadas o con cupo completo), de la más cercana a la más lejana. */
export async function getUpcomingExperiences(limit = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag("experiences");
  return db.experience.findMany({
    where: { status: { in: ["PUBLICADA", "CUPO_COMPLETO"] }, endDate: { gte: today() } },
    orderBy: { startDate: "asc" },
    take: limit,
    select: cardSelect,
  });
}

/** Calendario: próximas y pasadas (visibles). */
export async function getCalendar() {
  "use cache";
  cacheLife("hours");
  cacheTag("experiences");
  const visible = { in: [...VISIBLE_EXPERIENCE_STATUSES] };
  const [upcoming, past] = await Promise.all([
    db.experience.findMany({
      where: { status: { in: ["PUBLICADA", "CUPO_COMPLETO"] }, endDate: { gte: today() } },
      orderBy: { startDate: "asc" },
      select: cardSelect,
    }),
    db.experience.findMany({
      where: { status: visible, endDate: { lt: today() } },
      orderBy: { startDate: "desc" },
      take: 12,
      select: cardSelect,
    }),
  ]);
  return { upcoming, past };
}

/** Slugs visibles, para prerenderar los detalles en el build. */
export async function getVisibleExperienceSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag("experiences");
  const rows = await db.experience.findMany({
    where: { status: { in: [...VISIBLE_EXPERIENCE_STATUSES] } },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

const detailInclude = {
  format: true,
  venue: { select: { name: true, city: true, website: true } },
  hotel: { select: { name: true, city: true, website: true } },
  priceOptions: { orderBy: { sortOrder: "asc" as const } },
} as const;

async function loadExperience(slug: string, visibleOnly: boolean) {
  const experience = await db.experience.findFirst({
    where: { slug, ...(visibleOnly ? { status: { in: [...VISIBLE_EXPERIENCE_STATUSES] } } : {}) },
    include: detailInclude,
  });
  if (!experience) return null;
  return {
    ...experience,
    // Se calcula acá (dentro del caché) y no en el render: con Cache Components no se lee la hora en render.
    closedReason: registrationClosedReason(experience, new Date()),
  };
}

/**
 * Cupos en vivo (sin caché): se leen en cada request, dentro de <Suspense>.
 * El contenido de la experiencia se cachea; los lugares disponibles no, para que nunca se vean atrasados.
 * React.cache evita repetir la consulta si varios componentes la piden en el mismo render.
 */
export const getLiveAvailability = cache(async (experienceId: string) => {
  await connection();
  const holding = { in: [...SEAT_HOLDING_STATUSES] };
  const [experience, taken, byOption, options] = await Promise.all([
    db.experience.findUniqueOrThrow({ where: { id: experienceId }, select: { status: true, capacity: true } }),
    db.registration.count({ where: { experienceId, status: holding } }),
    db.registration.groupBy({ by: ["priceOptionId"], where: { experienceId, status: holding }, _count: { _all: true } }),
    db.priceOption.findMany({ where: { experienceId, capacity: { not: null } }, select: { id: true, capacity: true } }),
  ]);
  const takenByOption = new Map(byOption.map((r) => [r.priceOptionId, r._count._all]));
  const fullOptionIds = options.filter((o) => (takenByOption.get(o.id) ?? 0) >= (o.capacity ?? Infinity)).map((o) => o.id);
  const left = Math.max(0, experience.capacity - taken);
  return { taken, left, isFull: left === 0 || experience.status === "CUPO_COMPLETO", fullOptionIds };
});

/** Detalle público (solo visibles). Los cupos van aparte: getLiveAvailability. */
export async function getPublicExperience(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("experiences", experienceTag(slug));
  return loadExperience(slug, true);
}

/** Detalle sin filtro de estado, para la vista previa del admin (no cacheado). */
export async function getExperienceForPreview(slug: string) {
  return loadExperience(slug, false);
}

export type ExperienceDetail = NonNullable<Awaited<ReturnType<typeof loadExperience>>>;

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
