"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { experienceTag } from "@/lib/data/public";
import { parsePrice } from "@/lib/admin-rules";
import { isRegistrationStatus } from "@/lib/registration-admin-rules";
import { changeRegistrationStatus, deletePayment, recordPayment } from "@/lib/registration-admin";
import { adminCopy } from "@/content/admin";
import type { AdminActionState } from "../experiencias/actions";

const m = adminCopy.messages;
const ok = (message: string): AdminActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): AdminActionState => ({ ok: false, message, at: Date.now() });

/** Los cupos y el estado de la experiencia se ven en el sitio: invalidar su caché. */
function refreshPublic(slug: string) {
  updateTag("experiences");
  updateTag(experienceTag(slug));
}

export async function setRegistrationStatus(registrationId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const to = formData.get("to");
  if (!isRegistrationStatus(to)) return fail(m.statusNotAllowed);
  const result = await changeRegistrationStatus(registrationId, to);
  if (!result.ok) {
    const reasons = { NOT_FOUND: m.registrationNotFound, NOT_ALLOWED: m.statusNotAllowed, FULL: m.full, OPTION_FULL: m.optionFull };
    return fail(reasons[result.reason]);
  }
  refreshPublic(result.slug);
  return ok(m.statusChanged(adminCopy.registrationStatus[result.status]));
}

const paymentSchema = z.object({
  amount: z.string().transform((v, ctx) => {
    const n = parsePrice(v);
    if (n == null) {
      ctx.addIssue({ code: "custom", message: m.invalidAmount });
      return z.NEVER;
    }
    return n;
  }),
  method: z.enum(["TRANSFERENCIA", "EFECTIVO"], { error: m.invalidMethod }),
  // Fecha del input (YYYY-MM-DD) → mediodía en Buenos Aires, para que no cambie de día por zona horaria.
  paidAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, m.invalidDate)
    .transform((d) => new Date(`${d}T12:00:00-03:00`)),
  notes: z.string().trim().max(300).optional(),
});

export async function addPayment(registrationId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const parsed = paymentSchema.safeParse({
    amount: String(formData.get("amount") ?? ""),
    method: formData.get("method"),
    paidAt: String(formData.get("paidAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? m.invalidAmount);

  const result = await recordPayment(registrationId, parsed.data);
  if (!result.ok) return fail(m.registrationNotFound);
  refreshPublic(result.slug);
  return ok(m.paymentSaved(result.statusChanged ? adminCopy.registrationStatus[result.status] : null));
}

export async function removePayment(registrationId: string, paymentId: string, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  if (!(await deletePayment(registrationId, paymentId))) return fail(m.registrationNotFound);
  refresh();
  return ok(m.paymentDeleted);
}

export async function saveRegistrationNotes(registrationId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const notes = z.string().trim().max(2000).safeParse(String(formData.get("internalNotes") ?? ""));
  if (!notes.success) return fail(m.registrationNotFound);
  const { count } = await db.registration.updateMany({
    where: { id: registrationId },
    data: { internalNotes: notes.data || null },
  });
  if (count === 0) return fail(m.registrationNotFound);
  refresh();
  return ok(m.saved);
}
