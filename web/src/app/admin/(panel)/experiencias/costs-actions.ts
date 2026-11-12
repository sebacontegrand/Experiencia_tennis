"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { experienceTag } from "@/lib/data/public";
import { parsePrice } from "@/lib/admin-rules";
import { parsePercent, sharedCostPerPerson, suggestedPrice } from "@/lib/pricing";
import { adminCopy } from "@/content/admin";
import type { AdminActionState } from "./actions";

const m = adminCopy.costs.messages;
const ok = (message: string): AdminActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): AdminActionState => ({ ok: false, message, at: Date.now() });

const positiveInt = z.coerce.number().int().positive().max(10_000);

/** % de ganancia y asistencia esperada. No cambian nada del sitio. */
export async function saveProfitSettings(experienceId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const percent = parsePercent(String(formData.get("earningsPercent") ?? ""));
  if (percent === undefined) return fail(m.invalidPercent);
  const attendanceRaw = String(formData.get("expectedAttendance") ?? "").trim();
  const attendance = attendanceRaw === "" ? null : positiveInt.safeParse(attendanceRaw);
  if (attendance && !attendance.success) return fail(m.invalidAttendance);

  const { count } = await db.experience.updateMany({
    where: { id: experienceId },
    data: { earningsPercent: percent, expectedAttendance: attendance ? attendance.data : null },
  });
  if (count === 0) return fail(adminCopy.messages.notFound);
  refresh();
  return ok(adminCopy.messages.saved);
}

function readCostItem(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const amount = parsePrice(String(formData.get("amount") ?? ""));
  const kind = formData.get("kind") === "PER_PERSON" ? "PER_PERSON" : "TOTAL";
  if (!label || label.length > 120) return { error: m.labelRequired } as const;
  if (amount == null) return { error: m.invalidAmount } as const;
  return { data: { label, amount, kind } } as const;
}

export async function addCostItem(experienceId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const parsed = readCostItem(formData);
  if ("error" in parsed) return fail(parsed.error!);
  const exp = await db.experience.findUnique({ where: { id: experienceId }, select: { id: true, _count: { select: { costItems: true } } } });
  if (!exp) return fail(adminCopy.messages.notFound);
  await db.costItem.create({ data: { ...parsed.data, experienceId, sortOrder: exp._count.costItems + 1 } });
  refresh();
  return ok(m.added);
}

export async function saveCostItem(experienceId: string, itemId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const parsed = readCostItem(formData);
  if ("error" in parsed) return fail(parsed.error!);
  const { count } = await db.costItem.updateMany({ where: { id: itemId, experienceId }, data: parsed.data });
  if (count === 0) return fail(adminCopy.messages.notFound);
  refresh();
  return ok(adminCopy.messages.saved);
}

export async function deleteCostItem(experienceId: string, itemId: string, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  const { count } = await db.costItem.deleteMany({ where: { id: itemId, experienceId } });
  if (count === 0) return fail(adminCopy.messages.notFound);
  refresh();
  return ok(m.deleted);
}

/** Costo propio de una opción (p. ej. la habitación), por persona. Vacío = sin costo propio. */
export async function saveOptionCost(experienceId: string, optionId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("cost") ?? "");
  const cost = parsePrice(raw);
  if (cost === undefined) return fail(m.invalidAmount);
  const { count } = await db.priceOption.updateMany({ where: { id: optionId, experienceId }, data: { cost } });
  if (count === 0) return fail(adminCopy.messages.notFound);
  refresh();
  return ok(adminCopy.messages.saved);
}

/** Copia el precio sugerido al precio real de la opción. Se recalcula acá con los datos guardados. */
export async function applySuggestedPrice(experienceId: string, optionId: string, _prev: AdminActionState, _formData: FormData) {
  void _formData;
  await requireAdmin();
  const exp = await db.experience.findUnique({
    where: { id: experienceId },
    select: {
      slug: true,
      capacity: true,
      earningsPercent: true,
      expectedAttendance: true,
      costItems: { select: { amount: true, kind: true } },
      priceOptions: { where: { id: optionId }, select: { id: true, cost: true } },
    },
  });
  const option = exp?.priceOptions[0];
  if (!exp || !option) return fail(adminCopy.messages.notFound);
  const costPerPerson = sharedCostPerPerson(exp.costItems, exp.expectedAttendance ?? exp.capacity) + (option.cost ?? 0);
  const price = suggestedPrice(costPerPerson, exp.earningsPercent);
  if (price == null) return fail(m.noSuggestion);

  await db.priceOption.update({ where: { id: option.id }, data: { price } });
  updateTag("experiences");
  updateTag(experienceTag(exp.slug));
  return ok(m.priceApplied(new Intl.NumberFormat("es-AR").format(price)));
}
