"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { experienceTag } from "@/lib/data/public";
import { parsePrice, statusAfterCapacityChange, statusOnPublish } from "@/lib/admin-rules";
import { SEAT_HOLDING_STATUSES } from "@/lib/registration-rules";
import { adminCopy } from "@/content/admin";

export type AdminActionState = { ok: boolean; message: string; at: number } | null;

const m = adminCopy.messages;
const ok = (message: string): AdminActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): AdminActionState => ({ ok: false, message, at: Date.now() });

async function seatsTaken(experienceId: string) {
  return db.registration.count({ where: { experienceId, status: { in: [...SEAT_HOLDING_STATUSES] } } });
}

/** Invalida lo que el sitio público cachea de esta experiencia. */
function refreshPublic(slug: string) {
  updateTag("experiences");
  updateTag(experienceTag(slug));
}

const positiveInt = z.coerce.number().int().positive();

export async function saveSettings(experienceId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const exp = await db.experience.findUnique({ where: { id: experienceId } });
  if (!exp) return fail(m.notFound);

  const capacity = positiveInt.safeParse(formData.get("capacity"));
  if (!capacity.success) return fail(m.invalidCapacity);
  const audienceRaw = String(formData.get("audience") ?? "");
  const audience = audienceRaw === "MUJERES" || audienceRaw === "MIXTO" ? audienceRaw : null;
  const deadlineRaw = String(formData.get("registrationDeadline") ?? "").trim();
  // Fecha del input (YYYY-MM-DD) → fin de ese día en Buenos Aires (UTC-3)
  const registrationDeadline = /^\d{4}-\d{2}-\d{2}$/.test(deadlineRaw) ? new Date(`${deadlineRaw}T23:59:59-03:00`) : null;

  const taken = await seatsTaken(exp.id);
  if (capacity.data < taken) return fail(m.capacityBelowTaken(taken));

  await db.experience.update({
    where: { id: exp.id },
    data: {
      capacity: capacity.data,
      audience,
      registrationDeadline,
      status: statusAfterCapacityChange(exp.status, taken, capacity.data),
    },
  });
  refreshPublic(exp.slug);
  return ok(m.saved);
}

export async function setPublished(experienceId: string, publish: boolean, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  const exp = await db.experience.findUnique({ where: { id: experienceId } });
  if (!exp) return fail(m.notFound);

  if (publish) {
    if (exp.status !== "BORRADOR") return fail(m.cannotPublish);
    const taken = await seatsTaken(exp.id);
    await db.experience.update({ where: { id: exp.id }, data: { status: statusOnPublish(taken, exp.capacity) } });
    refreshPublic(exp.slug);
    return ok(m.published);
  }
  await db.experience.update({ where: { id: exp.id }, data: { status: "BORRADOR" } });
  refreshPublic(exp.slug);
  return ok(m.unpublished);
}

function readOption(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const price = parsePrice(String(formData.get("price") ?? ""));
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const capacity = capacityRaw === "" ? null : positiveInt.safeParse(capacityRaw);
  if (!label || label.length > 120) return { error: m.labelRequired } as const;
  if (price === undefined) return { error: m.invalidPrice } as const;
  if (capacity && !capacity.success) return { error: m.invalidCapacity } as const;
  return { data: { label, price, capacity: capacity ? capacity.data : null } } as const;
}

export async function savePriceOption(experienceId: string, optionId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const option = await db.priceOption.findFirst({ where: { id: optionId, experienceId }, include: { experience: true } });
  if (!option) return fail(m.notFound);
  const parsed = readOption(formData);
  if ("error" in parsed) return fail(parsed.error!);
  await db.priceOption.update({ where: { id: option.id }, data: parsed.data });
  refreshPublic(option.experience.slug);
  return ok(m.saved);
}

export async function addPriceOption(experienceId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const exp = await db.experience.findUnique({ where: { id: experienceId }, include: { priceOptions: true } });
  if (!exp) return fail(m.notFound);
  const parsed = readOption(formData);
  if ("error" in parsed) return fail(parsed.error!);
  const sortOrder = Math.max(0, ...exp.priceOptions.map((o) => o.sortOrder)) + 1;
  await db.priceOption.create({ data: { ...parsed.data, experienceId: exp.id, sortOrder } });
  refreshPublic(exp.slug);
  return ok(m.added);
}

export async function deletePriceOption(experienceId: string, optionId: string, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  const option = await db.priceOption.findFirst({
    where: { id: optionId, experienceId },
    include: { experience: true, _count: { select: { registrations: true } } },
  });
  if (!option) return fail(m.notFound);
  if (option._count.registrations > 0) return fail(m.optionHasRegistrations);
  await db.priceOption.delete({ where: { id: option.id } });
  refreshPublic(option.experience.slug);
  return ok(m.deleted);
}
