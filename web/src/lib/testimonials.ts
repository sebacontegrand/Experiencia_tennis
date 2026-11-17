import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

/**
 * Testimonios. Públicos (cacheados, tag "testimonials"): solo isPublic, nunca datos de contacto.
 * El formulario post-experiencia llega con el token de la inscripción (el mismo del link de pago).
 */
export async function getTestimonialContext(token: string) {
  return db.registration.findUnique({
    where: { payToken: token },
    select: {
      id: true,
      status: true,
      player: { select: { firstName: true, lastName: true } },
      experience: { select: { id: true, slug: true, title: true, startDate: true } },
      testimonial: { select: { authorName: true, authorInfo: true, quote: true } },
    },
  });
}

const publicSelect = {
  id: true,
  authorName: true,
  authorInfo: true,
  quote: true,
  experience: { select: { title: true, slug: true } },
} as const;

/** Para la home: los últimos publicados (de cualquier experiencia). */
export async function getPublicTestimonials(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag("testimonials");
  return db.testimonial.findMany({
    where: { isPublic: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: publicSelect,
  });
}

/** Los publicados de una experiencia (detalle y álbum). */
export async function getExperienceTestimonials(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("testimonials");
  return db.testimonial.findMany({
    where: { isPublic: true, experience: { slug } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: publicSelect,
  });
}
