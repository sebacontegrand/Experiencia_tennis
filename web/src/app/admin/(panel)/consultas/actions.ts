"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { isLeadStatus } from "@/lib/lead-rules";
import type { AdminActionState } from "../experiencias/actions";

const m = adminCopy.leads.messages;
const ok = (message: string): AdminActionState => ({ ok: true, message, at: Date.now() });
const fail = (message: string): AdminActionState => ({ ok: false, message, at: Date.now() });

export async function setLeadStatus(leadId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const to = formData.get("to");
  if (!isLeadStatus(to)) return fail(adminCopy.messages.statusNotAllowed);
  const { count } = await db.lead.updateMany({ where: { id: leadId }, data: { status: to } });
  if (count === 0) return fail(m.notFound);
  refresh();
  return ok(m.statusChanged(adminCopy.leads.status[to]));
}

export async function saveLeadNotes(leadId: string, _prev: AdminActionState, formData: FormData) {
  await requireAdmin();
  const notes = z.string().trim().max(3000).safeParse(String(formData.get("internalNotes") ?? ""));
  if (!notes.success) return fail(m.tooLong);
  const { count } = await db.lead.updateMany({ where: { id: leadId }, data: { internalNotes: notes.data || null } });
  if (count === 0) return fail(m.notFound);
  refresh();
  return ok(adminCopy.messages.saved);
}
