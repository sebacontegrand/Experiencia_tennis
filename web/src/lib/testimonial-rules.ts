import { z } from "zod";
import { testimonialCopy } from "@/content/testimonials";

const e = testimonialCopy.form.errors;
const clean = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v);

/** Lo que se publica: nombre como lo quiere mostrar, un dato opcional y el texto. */
export const testimonialSchema = z.object({
  authorName: z.preprocess(clean, z.string().min(2, e.name).max(60, e.name)),
  authorInfo: z.preprocess((v) => (clean(v) === "" ? undefined : clean(v)), z.string().max(80, e.info).optional()),
  quote: z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.string().min(20, e.quote).max(600, e.quote)),
});

export const testimonialFormSchema = testimonialSchema.extend({
  consent: z.literal("on", { error: e.consent }),
});

/** Nombre sugerido: "Laura G." */
export function suggestedName(firstName: string, lastName: string) {
  const initial = lastName.trim().charAt(0).toUpperCase();
  return initial ? `${firstName.trim()} ${initial}.` : firstName.trim();
}

/** ¿Puede dejar su opinión? Solo quien tuvo lugar (señada o confirmada) y una vez que empezó la experiencia. */
export function canLeaveTestimonial(status: string, startDate: Date, now = new Date()) {
  if (status !== "CONFIRMADA" && status !== "SENADA") return "NOT_ALLOWED" as const;
  if (startDate.getTime() > now.getTime()) return "NOT_YET" as const;
  return null;
}
