import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDate, formatPrice } from "@/lib/format";
import { amountPaid, balanceDue, nextStatuses, waNumber, type RegistrationStatus } from "@/lib/registration-admin-rules";
import { StatusBadge } from "@/components/admin/status-badge";
import { ActionForm, AdminField } from "@/components/admin/action-form";
import { adminInputClass } from "@/components/admin/styles";
import { StatusActions } from "@/components/admin/status-actions";
import { addPayment, removePayment, saveRegistrationNotes, setRegistrationStatus } from "../actions";

export const metadata: Metadata = { title: "Inscripción" };
const c = adminCopy.registration;

/** Hoy en Buenos Aires como YYYY-MM-DD (valor por defecto del input de fecha). */
function todayInput() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

export default async function RegistrationPage({ params }: PageProps<"/admin/inscripciones/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const r = await db.registration.findUnique({
    where: { id },
    include: {
      player: true,
      experience: { select: { id: true, title: true } },
      priceOption: { select: { label: true, price: true } },
      payments: { orderBy: [{ paidAt: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!r) notFound();

  const status = r.status as RegistrationStatus;
  const paid = amountPaid(r.payments);
  const price = r.priceOption?.price ?? null;
  const balance = balanceDue(price, paid);
  const wa = waNumber(r.player.whatsapp);
  const waText = encodeURIComponent(c.whatsappGreeting(r.player.firstName, r.experience.title));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/experiencias/${r.experience.id}/inscripciones`}
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-navy-900"
        >
          <ArrowLeft aria-hidden className="size-4" /> {c.back}
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl text-navy-900">
            {r.player.firstName} {r.player.lastName}
          </h1>
          <StatusBadge status={r.status} kind="registration" />
        </div>
        <p className="mt-1 text-ink-muted">
          {r.experience.title} · {c.registeredOn(formatDate(r.createdAt))}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {wa && (
            <a
              href={`https://wa.me/${wa}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <MessageCircle aria-hidden className="size-4" /> {c.whatsapp}
            </a>
          )}
          <a
            href={`mailto:${r.player.email}`}
            className="inline-flex h-12 items-center gap-2 rounded-sm border border-border bg-white px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
          >
            <Mail aria-hidden className="size-4" /> {c.email}
          </a>
        </div>
      </div>

      {/* Pagos primero: es lo que más se usa */}
      <Card title={c.paymentsTitle} hint={c.paymentsHint}>
        <dl className="grid grid-cols-3 gap-3">
          <Stat label={c.price} value={formatPrice(price)} />
          <Stat label={c.paid} value={formatPrice(paid)} />
          <Stat label={c.balance} value={balance == null ? "—" : formatPrice(balance)} />
        </dl>

        {r.payments.length === 0 ? (
          <p className="mt-5 text-sm text-ink-muted">{c.noPayments}</p>
        ) : (
          <ul className="mt-5 divide-y divide-border rounded-sm border border-border">
            {r.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-navy-900">
                    {formatPrice(p.amount)}
                    {p.status !== "APROBADO" && <span className="ml-2 text-xs font-normal text-ink-muted">({p.status.toLowerCase()})</span>}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {adminCopy.paymentMethod[p.method]} · {formatDate(p.paidAt ?? p.createdAt)}
                    {p.notes && <> · {p.notes}</>}
                  </p>
                </div>
                {p.method !== "MERCADO_PAGO" && (
                  <ActionForm
                    action={removePayment.bind(null, r.id, p.id)}
                    submitLabel={c.deletePayment}
                    pendingLabel="Borrando…"
                    variant="danger"
                    confirm={c.deletePaymentConfirm}
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 rounded-sm border border-dashed border-input p-4">
          <h3 className="text-sm font-semibold text-navy-900">{c.addPayment}</h3>
          <ActionForm action={addPayment.bind(null, r.id)} submitLabel={c.addPayment} className="mt-3">
            <div className="grid gap-4 sm:grid-cols-3">
              <AdminField label={c.amount} htmlFor="amount">
                <div className="relative">
                  <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted">
                    $
                  </span>
                  <input
                    id="amount"
                    name="amount"
                    inputMode="numeric"
                    required
                    placeholder={balance ? new Intl.NumberFormat("es-AR").format(balance) : ""}
                    className={`${adminInputClass} pl-8`}
                  />
                </div>
              </AdminField>
              <AdminField label={c.method} htmlFor="method">
                <select id="method" name="method" defaultValue="TRANSFERENCIA" className={adminInputClass}>
                  <option value="TRANSFERENCIA">{adminCopy.paymentMethod.TRANSFERENCIA}</option>
                  <option value="EFECTIVO">{adminCopy.paymentMethod.EFECTIVO}</option>
                </select>
              </AdminField>
              <AdminField label={c.paidAt} htmlFor="paidAt">
                <input id="paidAt" name="paidAt" type="date" required defaultValue={todayInput()} className={adminInputClass} />
              </AdminField>
            </div>
            <AdminField label={c.paymentNotes} htmlFor="notes">
              <input id="notes" name="notes" maxLength={300} placeholder={c.paymentNotesPlaceholder} className={adminInputClass} />
            </AdminField>
          </ActionForm>
        </div>
      </Card>

      <Card title={c.statusTitle} hint={c.statusHint}>
        <StatusActions
          action={setRegistrationStatus.bind(null, r.id)}
          options={nextStatuses(status).map((to) => ({
            value: to,
            label: adminCopy.statusAction[to],
            confirm: adminCopy.statusConfirm[to],
            variant: to === "CANCELADA" ? "danger" : to === "CONFIRMADA" ? "primary" : "secondary",
          }))}
        />
      </Card>

      <Card title={c.detailsTitle}>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label={c.option} value={r.priceOption?.label} />
          <Row label={c.doublesPartner} value={r.doublesPartner} />
          <Row label={c.roommate} value={r.roommate} />
          <Row label={c.menu} value={r.menuChoice} />
          <Row label={c.notes} value={r.notes} wide />
        </dl>
      </Card>

      <Card title={c.playerTitle}>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label={c.email} value={r.player.email} />
          <Row label={c.whatsapp} value={r.player.whatsapp} />
          <Row label={c.city} value={r.player.city} />
          <Row label={c.club} value={r.player.club} />
          <Row label={c.level} value={r.player.level} />
        </dl>
        <Link
          href={`/admin/jugadores/${r.player.id}`}
          className="mt-5 inline-flex h-11 items-center gap-2 text-sm font-semibold text-navy-900 underline underline-offset-4"
        >
          {c.playerProfile}
        </Link>
      </Card>

      <Card title={c.internalNotes} hint={c.internalNotesHint}>
        <ActionForm action={saveRegistrationNotes.bind(null, r.id)} submitLabel={adminCopy.edit.save}>
          <label htmlFor="internalNotes" className="sr-only">
            {c.internalNotes}
          </label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            rows={4}
            maxLength={2000}
            defaultValue={r.internalNotes ?? ""}
            className={`${adminInputClass} h-auto py-3`}
          />
        </ActionForm>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-cream p-3 sm:p-4">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-navy-900 sm:text-xl">{value}</dd>
    </div>
  );
}

function Row({ label, value, wide }: { label: string; value: string | null | undefined; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{value || "—"}</dd>
    </div>
  );
}
