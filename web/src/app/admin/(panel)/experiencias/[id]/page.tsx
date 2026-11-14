import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye, Image as ImageIcon, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDateRange } from "@/lib/format";
import { SEAT_HOLDING_STATUSES } from "@/lib/registration-rules";
import { StatusBadge } from "@/components/admin/status-badge";
import { CostsCard } from "@/components/admin/costs-card";
import { CollapsibleCard } from "@/components/admin/collapsible-card";
import { ActionForm, AdminField } from "@/components/admin/action-form";
import { adminInputClass } from "@/components/admin/styles";
import { ItineraryEditor } from "@/components/admin/itinerary-editor";
import { dateToInput } from "@/lib/experience-content";
import { parseItinerary } from "@/lib/itinerary";
import { addPriceOption, deleteExperience, deletePriceOption, savePriceOption, saveContent, saveItinerary, saveSettings, setPublished } from "../actions";

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
      costItems: { orderBy: { sortOrder: "asc" }, select: { id: true, label: true, amount: true, kind: true } },
    },
  });
  if (!e) notFound();

  const [formats, partners] = await Promise.all([
    db.experienceFormat.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.partner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, type: true } }),
  ]);
  const venues = partners.filter((p) => p.type === "CLUB" || p.type === "BARRIO" || p.id === e.venueId);
  const hotels = partners.filter((p) => p.type === "HOTEL" || p.id === e.hotelId);
  const itinerary = parseItinerary(e.itinerary);

  const [seatRegistrations, collected] = await Promise.all([
    db.registration.findMany({
      where: { experienceId: e.id, status: { in: [...SEAT_HOLDING_STATUSES] } },
      select: { priceOption: { select: { price: true, cost: true } } },
    }),
    db.payment.aggregate({ where: { status: "APROBADO", registration: { experienceId: e.id } }, _sum: { amount: true } }),
  ]);

  const [photoCount, hiddenPhotos] = await Promise.all([
    db.galleryImage.count({ where: { experienceId: e.id } }),
    db.galleryImage.count({ where: { experienceId: e.id, isPublic: false } }),
  ]);
  const byStatus = await db.registration.groupBy({ by: ["status"], where: { experienceId: e.id }, _count: { _all: true } });
  const n = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;
  const taken = SEAT_HOLDING_STATUSES.reduce((sum, s) => sum + n(s), 0);
  const total = byStatus.reduce((sum, r) => sum + r._count._all, 0);
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

      <CostsCard
        data={{
          id: e.id,
          capacity: e.capacity,
          earningsPercent: e.earningsPercent,
          expectedAttendance: e.expectedAttendance,
          costItems: e.costItems,
          priceOptions: e.priceOptions.map((o) => ({ id: o.id, label: o.label, price: o.price, cost: o.cost })),
          seatRegistrations: seatRegistrations.map((r) => ({
            price: r.priceOption?.price ?? null,
            optionCost: r.priceOption?.cost ?? null,
          })),
          collected: collected._sum.amount ?? 0,
        }}
      />

      {/* Precios */}
      <CollapsibleCard title={c.pricesTitle} summary={c.pricesSummary(e.priceOptions.length, missingPrices)}>
        <p className="mb-5 text-sm text-ink-muted">{c.pricesHint}</p>
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
                        // key con el precio: si cambia desde "Usar precio sugerido", el campo muestra el valor nuevo.
                        key={`price-${o.price}`}
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
      </CollapsibleCard>

      {/* Textos y fechas */}
      <CollapsibleCard title={c.contentTitle} summary={c.contentSummary}>
        <ActionForm action={saveContent.bind(null, e.id)} submitLabel={c.save}>
          <AdminField label={c.titleField} htmlFor="title">
            <input id="title" name="title" required maxLength={120} defaultValue={e.title} className={adminInputClass} />
          </AdminField>
          <AdminField label={c.slug} hint={e.status === "BORRADOR" ? c.slugHint : c.slugLocked} htmlFor="slug">
            <input
              id="slug"
              name="slug"
              required
              maxLength={80}
              defaultValue={e.slug}
              readOnly={e.status !== "BORRADOR"}
              autoCapitalize="none"
              spellCheck={false}
              className={`${adminInputClass} read-only:bg-cream read-only:text-ink-muted`}
            />
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label={c.format} htmlFor="formatId">
              <select id="formatId" name="formatId" defaultValue={e.formatId} className={adminInputClass}>
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label={c.startDate} htmlFor="startDate">
              <input id="startDate" name="startDate" type="date" required defaultValue={dateToInput(e.startDate)} className={adminInputClass} />
            </AdminField>
            <AdminField label={c.endDate} htmlFor="endDate">
              <input id="endDate" name="endDate" type="date" required defaultValue={dateToInput(e.endDate)} className={adminInputClass} />
            </AdminField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label={c.destination} hint={c.destinationHint} htmlFor="destination">
              <input id="destination" name="destination" required maxLength={120} defaultValue={e.destination} className={adminInputClass} />
            </AdminField>
            <AdminField label={c.venue} htmlFor="venueId">
              <select id="venueId" name="venueId" defaultValue={e.venueId ?? ""} className={adminInputClass}>
                <option value="">{c.noPartner}</option>
                {venues.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label={c.hotel} htmlFor="hotelId">
              <select id="hotelId" name="hotelId" defaultValue={e.hotelId ?? ""} className={adminInputClass}>
                <option value="">{c.noPartner}</option>
                {hotels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <AdminField label={c.summary} hint={c.summaryHint} htmlFor="summary">
            <textarea id="summary" name="summary" rows={2} maxLength={300} defaultValue={e.summary ?? ""} className={`${adminInputClass} h-auto py-3`} />
          </AdminField>
          <AdminField label={c.description} hint={c.descriptionHint} htmlFor="description">
            <textarea id="description" name="description" rows={8} maxLength={5000} defaultValue={e.description} className={`${adminInputClass} h-auto py-3`} />
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label={c.includes} hint={c.listHint} htmlFor="includes">
              <textarea id="includes" name="includes" rows={7} defaultValue={e.includes.join("\n")} className={`${adminInputClass} h-auto py-3`} />
            </AdminField>
            <AdminField label={c.excludes} hint={c.listHint} htmlFor="excludes">
              <textarea id="excludes" name="excludes" rows={7} defaultValue={e.excludes.join("\n")} className={`${adminInputClass} h-auto py-3`} />
            </AdminField>
          </div>
          <AdminField label={c.rainPlan} hint={c.rainPlanHint} htmlFor="rainPlan">
            <textarea id="rainPlan" name="rainPlan" rows={2} maxLength={1000} defaultValue={e.rainPlan ?? ""} className={`${adminInputClass} h-auto py-3`} />
          </AdminField>
          <AdminField label={c.menuOptions} hint={c.menuOptionsHint} htmlFor="menuOptions">
            <textarea id="menuOptions" name="menuOptions" rows={3} defaultValue={e.menuOptions.join("\n")} className={`${adminInputClass} h-auto py-3`} />
          </AdminField>
        </ActionForm>
      </CollapsibleCard>

      {/* Cronograma */}
      <CollapsibleCard title={c.itineraryTitle} summary={c.itinerarySummary(itinerary.length)}>
        <p className="mb-5 text-sm text-ink-muted">{c.itineraryHint}</p>
        <ActionForm action={saveItinerary.bind(null, e.id)} submitLabel={c.saveItinerary}>
          <ItineraryEditor initial={itinerary} />
        </ActionForm>
      </CollapsibleCard>

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
          <Stat label="Pendientes de pago" value={n("PENDIENTE")} />
          <Stat label="Señadas o confirmadas" value={n("CONFIRMADA") + n("SENADA")} />
          <Stat label="Lista de espera" value={n("LISTA_ESPERA")} />
        </dl>
        <Link
          href={`/admin/experiencias/${e.id}/inscripciones`}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-sm bg-navy-900 px-6 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Users aria-hidden className="size-4" /> {adminCopy.registrations.openList}
        </Link>
      </Card>

      {/* Fotos (galería del sitio) */}
      <Card title={adminCopy.photos.cardTitle} hint={adminCopy.photos.cardHint}>
        <p className="text-sm text-ink">{adminCopy.photos.cardSummary(photoCount, hiddenPhotos)}</p>
        <Link
          href={`/admin/experiencias/${e.id}/fotos`}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-sm border border-navy-900 px-6 text-sm font-semibold text-navy-900 hover:bg-cream"
        >
          <ImageIcon aria-hidden className="size-4" /> {adminCopy.photos.open}
        </Link>
      </Card>

      {/* Eliminar: al final y separado, para no tocarlo sin querer. */}
      <section aria-labelledby="eliminar" className="rounded-sm border border-destructive/30 bg-white p-5 sm:p-7">
        <h2 id="eliminar" className="font-serif text-2xl text-navy-900">
          {c.deleteTitle}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{total > 0 ? c.deleteBlocked(total) : c.deleteText}</p>
        <ActionForm
          action={deleteExperience.bind(null, e.id)}
          submitLabel={c.deleteButton}
          pendingLabel="Eliminando…"
          variant="danger"
          confirm={c.deleteConfirm(e.title)}
          disabled={total > 0}
          className="mt-5"
        />
      </section>
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
