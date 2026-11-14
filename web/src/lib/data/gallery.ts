import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { VISIBLE_EXPERIENCE_STATUSES } from "@/lib/registration-rules";
import { experienceTag } from "@/lib/data/public";

/**
 * Galería pública (cacheada). Se invalida con "gallery" (listado) y `gallery:<slug>` (álbum)
 * desde las acciones de fotos del panel; también escucha los tags de experiencias.
 * Solo se ven fotos con isPublic de experiencias visibles (publicadas, completas o finalizadas).
 */
export const galleryTag = (slug: string) => `gallery:${slug}`;

const visible = { in: [...VISIBLE_EXPERIENCE_STATUSES] };
const photoSelect = { id: true, url: true, alt: true, width: true, height: true } as const;

/** Álbumes con al menos una foto visible, del más reciente al más viejo. */
export async function getAlbums() {
  "use cache";
  cacheLife("hours");
  cacheTag("gallery", "experiences");
  return db.experience.findMany({
    where: { status: visible, gallery: { some: { isPublic: true } } },
    orderBy: { startDate: "desc" },
    select: {
      slug: true,
      title: true,
      startDate: true,
      endDate: true,
      destination: true,
      format: { select: { name: true } },
      gallery: { where: { isPublic: true }, orderBy: { sortOrder: "asc" }, take: 3, select: photoSelect },
      _count: { select: { gallery: { where: { isPublic: true } } } },
    },
  });
}

/** Próximos álbumes: experiencias publicadas que todavía no tienen fotos. */
export async function getUpcomingAlbums() {
  "use cache";
  cacheLife("hours");
  cacheTag("gallery", "experiences");
  const today = new Date(new Date().toISOString().slice(0, 10));
  return db.experience.findMany({
    where: { status: { in: ["PUBLICADA", "CUPO_COMPLETO"] }, endDate: { gte: today }, gallery: { none: { isPublic: true } } },
    orderBy: { startDate: "asc" },
    take: 6,
    select: { slug: true, title: true, startDate: true, endDate: true, destination: true, format: { select: { name: true, slug: true } } },
  });
}

export async function getAlbum(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("gallery", galleryTag(slug), experienceTag(slug));
  return db.experience.findFirst({
    where: { slug, status: visible },
    select: {
      slug: true,
      title: true,
      startDate: true,
      endDate: true,
      destination: true,
      format: { select: { name: true } },
      gallery: { where: { isPublic: true }, orderBy: { sortOrder: "asc" }, select: photoSelect },
    },
  });
}

export async function getAlbumSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag("gallery", "experiences");
  const rows = await db.experience.findMany({
    where: { status: visible, gallery: { some: { isPublic: true } } },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

/** Cantidad de fotos visibles de una experiencia (para el link «Ver las fotos» del detalle). */
export async function getAlbumCount(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("gallery", galleryTag(slug));
  return db.galleryImage.count({ where: { isPublic: true, experience: { slug, status: visible } } });
}
