"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { testimonialSchema } from "@/lib/testimonial-rules";
import { testimonialCopy } from "@/content/testimonials";
import { adminCopy } from "@/content/admin";
import type { AdminActionState } from "../experiencias/actions";

const m = testimonialCopy.admin;
const ok = (message: string): AdminActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): AdminActionState => ({ ok: false, message, at: Date.now() });

function refreshPublic() {
  updateTag("testimonials");
  refresh();
}

export async function setTestimonialPublic(id: string, isPublic: boolean, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  const { count } = await db.testimonial.updateMany({ where: { id }, data: { isPublic } });
  if (!count) return fail(adminCopy.messages.notFound);
  refreshPublic();
  return ok(m.saved);
}

export async function deleteTestimonial(id: string, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  await db.testimonial.deleteMany({ where: { id } });
  refreshPublic();
  return ok(m.deleted);
}

/** Carga manual (p. ej. uno que llegó por WhatsApp). Queda publicado: Gabriela ya lo revisó. */
export async function addTestimonial(_prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const parsed = testimonialSchema
    .extend({ experienceId: z.string().max(40).optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? adminCopy.messages.notFound);
  const { experienceId, ...data } = parsed.data;
  if (experienceId && !(await db.experience.findUnique({ where: { id: experienceId }, select: { id: true } }))) {
    return fail(adminCopy.messages.notFound);
  }
  await db.testimonial.create({ data: { ...data, authorInfo: data.authorInfo ?? null, experienceId: experienceId || null, isPublic: true } });
  refreshPublic();
  return ok(m.saved);
}
