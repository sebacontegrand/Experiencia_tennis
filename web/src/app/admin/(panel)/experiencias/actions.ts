"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { experienceTag } from "@/lib/data/public";
import { parsePrice, statusAfterCapacityChange, statusOnPublish } from "@/lib/admin-rules";
import { SEAT_HOLDING_STATUSES } from "@/lib/registration-rules";
import { adminCopy } from "@/content/admin";
import { checkDates, cleanItinerary, dateFromInput, isValidSlug, linesToList, slugify, uniqueSlug } from "@/lib/experience-content";
import type { Prisma } from "@/generated/prisma/client";

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
    if (!exp.description.trim()) return fail(m.missingDescription);
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

// ─── Alta y contenido ────────────────────────────────────────────────

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

const dateMessages = { INVALID: m.datesInvalid, END_BEFORE_START: m.datesOrder, TOO_LONG: m.datesTooLong } as const;

/** Título, formato, fechas y destino: lo común al alta y a la edición. */
async function readBasics(formData: FormData) {
  const title = text(formData, "title").replace(/\s+/g, " ");
  const destination = text(formData, "destination").replace(/\s+/g, " ");
  if (!title) return { error: m.titleRequired } as const;
  if (!destination) return { error: m.destinationRequired } as const;
  if (title.length > 120 || destination.length > 120) return { error: m.tooLong } as const;
  const format = await db.experienceFormat.findUnique({ where: { id: text(formData, "formatId") }, select: { id: true } });
  if (!format) return { error: m.invalidFormat } as const;
  const startDate = dateFromInput(text(formData, "startDate"));
  const endDate = dateFromInput(text(formData, "endDate"));
  const problem = checkDates(startDate, endDate);
  if (problem) return { error: dateMessages[problem] } as const;
  return { data: { title, destination, formatId: format.id, startDate: startDate!, endDate: endDate! } } as const;
}

/** Alta: se crea como borrador y lleva a la pantalla de edición. */
export async function createExperience(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const basics = await readBasics(formData);
  if ("error" in basics) return fail(basics.error!);
  const capacity = positiveInt.safeParse(formData.get("capacity"));
  if (!capacity.success || capacity.data > 1000) return fail(m.invalidCapacity);

  const base = slugify(basics.data.title, basics.data.startDate.getUTCFullYear());
  const taken = await db.experience.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } });
  const exp = await db.experience.create({
    data: { ...basics.data, slug: uniqueSlug(base, taken.map((t) => t.slug)), capacity: capacity.data, description: "", status: "BORRADOR" },
  });
  updateTag("experiences");
  redirect(`/admin/experiencias/${exp.id}`);
}

/** Textos, fechas, lugar y listas. La dirección (slug) solo se cambia mientras es borrador. */
export async function saveContent(experienceId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const exp = await db.experience.findUnique({ where: { id: experienceId } });
  if (!exp) return fail(m.notFound);

  const basics = await readBasics(formData);
  if ("error" in basics) return fail(basics.error!);

  let slug = exp.slug;
  if (exp.status === "BORRADOR") {
    slug = text(formData, "slug").toLowerCase();
    if (!isValidSlug(slug)) return fail(m.invalidSlug);
    if (slug !== exp.slug && (await db.experience.findUnique({ where: { slug }, select: { id: true } }))) return fail(m.slugTaken);
  }

  const summary = text(formData, "summary");
  const description = text(formData, "description").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  const rainPlan = text(formData, "rainPlan");
  if (summary.length > 300 || description.length > 5000 || rainPlan.length > 1000) return fail(m.tooLong);

  // Sede y hotel: solo partners existentes (vacío = sin definir).
  const partnerIds = [text(formData, "venueId"), text(formData, "hotelId")].filter(Boolean);
  if (partnerIds.length) {
    const found = await db.partner.count({ where: { id: { in: partnerIds } } });
    if (found !== new Set(partnerIds).size) return fail(m.invalidPartner);
  }

  await db.experience.update({
    where: { id: exp.id },
    data: {
      ...basics.data,
      slug,
      summary: summary || null,
      description,
      rainPlan: rainPlan || null,
      includes: linesToList(text(formData, "includes")),
      excludes: linesToList(text(formData, "excludes")),
      menuOptions: linesToList(text(formData, "menuOptions"), 12, 120),
      venueId: text(formData, "venueId") || null,
      hotelId: text(formData, "hotelId") || null,
    },
  });
  refreshPublic(exp.slug);
  if (slug !== exp.slug) refreshPublic(slug);
  return ok(m.saved);
}

export async function saveItinerary(experienceId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const exp = await db.experience.findUnique({ where: { id: experienceId }, select: { id: true, slug: true } });
  if (!exp) return fail(m.notFound);
  const itinerary = cleanItinerary(String(formData.get("itinerary") ?? ""));
  if (!itinerary) return fail(m.invalidItinerary);
  await db.experience.update({
    where: { id: exp.id },
    data: { itinerary: itinerary.length ? (itinerary as Prisma.InputJsonValue) : ([] as Prisma.InputJsonValue) },
  });
  refreshPublic(exp.slug);
  return ok(m.saved);
}
