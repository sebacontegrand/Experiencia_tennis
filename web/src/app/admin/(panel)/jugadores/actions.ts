"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { genderValues } from "@/content/forms";
import type { AdminActionState } from "../experiencias/actions";

const m = adminCopy.players.messages;
const ok = (message: string): AdminActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): AdminActionState => ({ ok: false, message, at: Date.now() });

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v.replace(/\s+/g, " ") || null);

const playerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email()),
  whatsapp: optional(40),
  city: optional(80),
  club: optional(120),
  level: optional(80),
  gender: z.enum(genderValues).or(z.literal("").transform(() => null)),
});

export async function savePlayer(playerId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(
    ["firstName", "lastName", "email", "whatsapp", "city", "club", "level", "gender"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const parsed = playerSchema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === "firstName" || field === "lastName") return fail(m.nameRequired);
    if (field === "email") return fail(m.invalidEmail);
    return fail(m.tooLong);
  }

  const other = await db.player.findFirst({ where: { email: parsed.data.email, NOT: { id: playerId } }, select: { id: true } });
  if (other) return fail(m.emailTaken);

  const { count } = await db.player.updateMany({ where: { id: playerId }, data: parsed.data });
  if (count === 0) return fail(m.notFound);
  refresh();
  return ok(adminCopy.messages.saved);
}

export async function savePlayerNotes(playerId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const notes = z.string().trim().max(2000).safeParse(String(formData.get("internalNotes") ?? ""));
  if (!notes.success) return fail(m.tooLong);
  const { count } = await db.player.updateMany({ where: { id: playerId }, data: { internalNotes: notes.data || null } });
  if (count === 0) return fail(m.notFound);
  refresh();
  return ok(adminCopy.messages.saved);
}

/**
 * Baja de comunicaciones (p. ej. lo pidió por WhatsApp). Desde el panel solo se puede dar de baja:
 * el alta del consentimiento la da la persona en el sitio.
 */
export async function revokeConsent(playerId: string, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  const { count } = await db.player.updateMany({
    where: { id: playerId },
    data: { marketingConsent: false, marketingConsentAt: null },
  });
  if (count === 0) return fail(m.notFound);
  refresh();
  return ok(m.revoked);
}
