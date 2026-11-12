import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { ActionForm, AdminField } from "@/components/admin/action-form";
import { adminInputClass } from "@/components/admin/styles";
import { createExperience } from "../actions";

export const metadata: Metadata = { title: "Nueva experiencia" };
const c = adminCopy.create;
const e = adminCopy.edit;

export default async function NewExperiencePage() {
  await requireAdmin();
  const formats = await db.experienceFormat.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/experiencias" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted hover:text-navy-900">
          <ArrowLeft aria-hidden className="size-4" /> {c.back}
        </Link>
        <h1 className="mt-4 font-serif text-4xl text-navy-900">{c.title}</h1>
        <p className="mt-2 max-w-prose text-ink-muted">{c.intro}</p>
      </div>

      <section className="rounded-sm bg-white p-5 sm:p-7">
        <ActionForm action={createExperience} submitLabel={c.submit} pendingLabel={c.pending}>
          <AdminField label={e.titleField} htmlFor="title">
            <input id="title" name="title" required maxLength={120} placeholder="Ej.: Experiencia Tenis Pilar" className={adminInputClass} />
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label={e.format} htmlFor="formatId">
              <select id="formatId" name="formatId" required defaultValue={formats[0]?.id} className={adminInputClass}>
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label={e.destination} hint={e.destinationHint} htmlFor="destination">
              <input id="destination" name="destination" required maxLength={120} className={adminInputClass} />
            </AdminField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label={e.startDate} htmlFor="startDate">
              <input id="startDate" name="startDate" type="date" required className={adminInputClass} />
            </AdminField>
            <AdminField label={e.endDate} htmlFor="endDate">
              <input id="endDate" name="endDate" type="date" required className={adminInputClass} />
            </AdminField>
            <AdminField label={e.capacity} htmlFor="capacity">
              <input id="capacity" name="capacity" inputMode="numeric" required className={adminInputClass} />
            </AdminField>
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
