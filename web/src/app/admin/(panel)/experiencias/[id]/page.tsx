import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDateRange } from "@/lib/format";
import { SEAT_HOLDING_STATUSES } from "@/lib/registration-rules";
import { StatusBadge } from "@/components/admin/status-badge";
import { ActionForm, AdminField, adminInputClass } from "@/components/admin/action-form";
import { addPriceOption, deletePriceOption, savePriceOption, saveSettings, setPublished } from "../actions";

export const metadata: Metadata = { title: "Editar experiencia" };
const c = adminCopy.edit;

/** Fecha guardada → valor del input date en hora de Buenos Aires. */
function toDateInput(d: Date | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(d);
}

/** 850000 → "850.000" para editar cómodo. */
function priceInput(n: number | null) {
  return n == null ? "" : new Intl.NumberFormat("es-AR").format(n);
}

export default async function EditExperiencePage({ params }: PageProps<"/admin/experiencias/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const e = await db.experience.findUnique({
    where: { id },
    include: {
      format: { select: { name: true } },
      priceOptions: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { registrations: true } } } },
    },
  });
  if (!e) notFound();

  const byStatus = await db.registration.groupBy({ by: ["status"], where: { experienceId: e.id }, _count: { _all: true } });
  const n = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;
  const taken = SEAT_HOLDING_STATUSES.reduce((sum, s) => sum + n(s), 0);
  const missingPrices = e.priceOptions.filter((o) => o.price == null).length;
  const isVisible = e.status === "PUBLICADA" || e.status === "CUPO_COMPLETO";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/experiencias" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-navy-900">
          <ArrowLeft aria-hidden className="size-4" /> {c.back}
        </Link>
        <p className="mt-6 text-xs font-semibold tracking-widest text-gold-deep uppercase">{e.format.name}</p>
        <h1 className="mt-1 font-serif text-4xl text-navy-900">{e.title}</h1>
        <p className="mt-1 text-ink-muted">{formatDateRange(e.startDate, e.endDate)}</p>
      </div>

      {/* Publicación */}
      <Card title={c.publishTitle}>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={e.status} />
          <p className="text-sm text-ink">
            {e.status === "BORRADOR" ? c.draftText : e.status === "CUPO_COMPLETO" ? c.fullText : isVisible ? c.publishedText : ""}
          </p>
        </div>
        {missingPrices > 0 && (
          <p className="mt-4 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">{c.missingPrices(missingPrices)}</p>
        )}
        <div className="mt-5 flex flex-wrap items-start gap-3">
          {(e.status === "BORRADOR" || isVisible) && (
            // Un solo formulario que cambia de acción: así el mensaje ("Publicada…") sigue visible después.
            <ActionForm
              key="publish-toggle"
              action={setPublished.bind(null, e.id, !isVisible)}
              submitLabel={isVisible ? c.unpublish : c.publish}
              pendingLabel={isVisible ? "Guardando…" : "Publicando…"}
              variant={isVisible ? "secondary" : "primary"}
              confirm={isVisible ? c.unpublishConfirm : undefined}
            />
          )}
          <Link
            href={`/admin/experiencias/${e.id}/vista-previa`}
            className="inline-flex h-12 items-center gap-2 rounded-sm border border-border bg-white px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
          >
            <Eye aria-hidden className="size-4" /> {c.preview}
          </Link>
          {isVisible && (
            <a
              href={`/experiencias/${e.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-sm border border-border bg-white px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
            >
              <ExternalLink aria-hidden className="size-4" /> {c.viewLive}
            </a>
          )}
        </div>
      </Card>

      {/* Precios */}
      <Card title={c.pricesTitle} hint={c.pricesHint}>
        <ul className="space-y-4">
          {e.priceOptions.map((o) => (
            <li key={o.id} className="rounded-sm border border-border p-4">
              <ActionForm action={savePriceOption.bind(null, e.id, o.id)} submitLabel={c.save}>
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
                  <AdminField label={c.optionLabel} htmlFor={`label-${o.id}`}>
                    <input id={`label-${o.id}`} name="label" defaultValue={o.label} required className={adminInputClass} />
                  </AdminField>
                  <AdminField label={c.optionPrice} htmlFor={`price-${o.id}`}>
                    <div className="relative">
                      <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted">$</span>
                      <input
                        id={`price-${o.id}`}
                        name="price"
                        inputMode="numeric"
                        defaultValue={priceInput(o.price)}
                        placeholder="Consultar"
                        className={`${adminInputClass} pl-8`}
                      />
                    </div>
                  </AdminField>
                  <AdminField label={c.optionCapacity} hint={c.optionCapacityHint} htmlFor={`cap-${o.id}`}>
                    <input id={`cap-${o.id}`} name="capacity" inputMode="numeric" defaultValue={o.capacity ?? ""} className={adminInputClass} />
                  </AdminField>
                </div>
              </ActionForm>
              {o._count.registrations === 0 && (
                <ActionForm
                  action={deletePriceOption.bind(null, e.id, o.id)}
                  submitLabel={c.deleteOption}
                  pendingLabel="Eliminando…"
                  variant="danger"
                  confirm={`¿Eliminar «${o.label}»?`}
                  className="mt-3"
                />
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-sm border border-dashed border-input p-4">
          <h3 className="text-sm font-semibold text-navy-900">{c.addTitle}</h3>
          <ActionForm action={addPriceOption.bind(null, e.id)} submitLabel={c.add} pendingLabel="Agregando…" className="mt-3">
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
              <AdminField label={c.optionLabel} htmlFor="label-new">
                <input id="label-new" name="label" required placeholder="Ej.: Sin alojamiento" className={adminInputClass} />
              </AdminField>
              <AdminField label={c.optionPrice} htmlFor="price-new">
                <input id="price-new" name="price" inputMode="numeric" placeholder="Consultar" className={adminInputClass} />
              </AdminField>
              <AdminField label={c.optionCapacity} hint={c.optionCapacityHint} htmlFor="cap-new">
                <input id="cap-new" name="capacity" inputMode="numeric" className={adminInputClass} />
              </AdminField>
            </div>
          </ActionForm>
        </div>
      </Card>

      {/* Datos */}
      <Card title={c.settingsTitle}>
        <ActionForm action={saveSettings.bind(null, e.id)} submitLabel={c.save}>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label={c.capacity} htmlFor="capacity">
              <input id="capacity" name="capacity" inputMode="numeric" required defaultValue={e.capacity} className={adminInputClass} />
            </AdminField>
            <AdminField label={c.audience} htmlFor="audience">
              <select id="audience" name="audience" defaultValue={e.audience ?? ""} className={adminInputClass}>
                {c.audienceOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label={c.deadline} hint={c.deadlineHint} htmlFor="deadline">
              <input id="deadline" name="registrationDeadline" type="date" defaultValue={toDateInput(e.registrationDeadline)} className={adminInputClass} />
            </AdminField>
          </div>
        </ActionForm>
      </Card>

      {/* Inscripciones (resumen) */}
      <Card title={c.registrationsTitle} hint={c.registrationsHint}>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Con lugar" value={`${taken} / ${e.capacity}`} />
          <Stat label="Pendientes de seña" value={n("PENDIENTE")} />
          <Stat label="Confirmadas" value={n("CONFIRMADA") + n("SENADA")} />
          <Stat label="Lista de espera" value={n("LISTA_ESPERA")} />
        </dl>
      </Card>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl text-navy-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm bg-cream p-4">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 font-serif text-3xl text-navy-900">{value}</dd>
    </div>
  );
}
