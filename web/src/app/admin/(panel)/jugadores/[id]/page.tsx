import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Mail, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { genderOptions, levelOptions } from "@/content/forms";
import { formatDate, formatDateRange } from "@/lib/format";
import { waNumber } from "@/lib/registration-admin-rules";
import { StatusBadge } from "@/components/admin/status-badge";
import { ActionForm, AdminField } from "@/components/admin/action-form";
import { adminInputClass } from "@/components/admin/styles";
import { revokeConsent, savePlayer, savePlayerNotes } from "../actions";

export const metadata: Metadata = { title: "Jugador" };
const c = adminCopy.players;
const p = c.profile;

export default async function PlayerPage({ params }: PageProps<"/admin/jugadores/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const player = await db.player.findUnique({
    where: { id },
    include: {
      registrations: {
        orderBy: { experience: { startDate: "desc" } },
        select: {
          id: true,
          status: true,
          priceOption: { select: { label: true } },
          experience: { select: { title: true, startDate: true, endDate: true } },
        },
      },
    },
  });
  if (!player) notFound();

  const wa = waNumber(player.whatsapp);
  const levels = player.level && !(levelOptions as readonly string[]).includes(player.level) ? [player.level, ...levelOptions] : levelOptions;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/jugadores" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted hover:text-navy-900">
          <ArrowLeft aria-hidden className="size-4" /> {p.back}
        </Link>
        <h1 className="mt-4 font-serif text-4xl text-navy-900">
          {player.firstName} {player.lastName}
        </h1>
        <p className="mt-1 text-ink-muted">
          {[player.city, player.club, player.level].filter(Boolean).join(" · ")}
          {(player.city || player.club || player.level) && <br />}
          {p.since(formatDate(player.createdAt))} · {c.source[player.source]}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <MessageCircle aria-hidden className="size-4" /> {p.whatsapp}
            </a>
          )}
          <a
            href={`mailto:${player.email}`}
            className="inline-flex h-12 items-center gap-2 rounded-sm border border-border bg-white px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
          >
            <Mail aria-hidden className="size-4" /> {p.email}
          </a>
        </div>
      </div>

      <Card title={p.historyTitle}>
        {player.registrations.length === 0 ? (
          <p className="text-sm text-ink-muted">{p.historyEmpty}</p>
        ) : (
          <ul className="divide-y divide-border rounded-sm border border-border">
            {player.registrations.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/inscripciones/${r.id}`} className="flex items-center gap-3 p-4 hover:bg-cream">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy-900">{r.experience.title}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {formatDateRange(r.experience.startDate, r.experience.endDate)}
                      {r.priceOption && <> · {r.priceOption.label}</>}
                    </p>
                  </div>
                  <StatusBadge status={r.status} kind="registration" />
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={p.consentTitle}>
        <p className={player.marketingConsent ? "text-sm text-ink" : "text-sm text-ink-muted"}>
          {player.marketingConsent
            ? player.marketingConsentAt
              ? p.consentSince(formatDate(player.marketingConsentAt))
              : `${c.consentYes}.`
            : p.consentNever}
        </p>
        {/* Siempre montado (deshabilitado si no hay consentimiento) para que el "Listo" siga visible. */}
        <ActionForm
          action={revokeConsent.bind(null, player.id)}
          submitLabel={p.revoke}
          pendingLabel="Guardando…"
          variant="danger"
          confirm={p.revokeConfirm}
          disabled={!player.marketingConsent}
          className="mt-4"
        />
      </Card>

      <Card title={p.detailsTitle} hint={p.detailsHint}>
        <ActionForm action={savePlayer.bind(null, player.id)} submitLabel={p.save}>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label={p.firstName} htmlFor="firstName">
              <input id="firstName" name="firstName" required maxLength={80} defaultValue={player.firstName} autoComplete="off" className={adminInputClass} />
            </AdminField>
            <AdminField label={p.lastName} htmlFor="lastName">
              <input id="lastName" name="lastName" required maxLength={80} defaultValue={player.lastName} autoComplete="off" className={adminInputClass} />
            </AdminField>
            <AdminField label={p.emailField} htmlFor="email">
              <input id="email" name="email" type="email" required maxLength={200} defaultValue={player.email} autoComplete="off" className={adminInputClass} />
            </AdminField>
            <AdminField label={p.whatsappField} htmlFor="whatsapp">
              <input id="whatsapp" name="whatsapp" type="tel" maxLength={40} defaultValue={player.whatsapp ?? ""} autoComplete="off" className={adminInputClass} />
            </AdminField>
            <AdminField label={c.city} htmlFor="city">
              <input id="city" name="city" maxLength={80} defaultValue={player.city ?? ""} autoComplete="off" className={adminInputClass} />
            </AdminField>
            <AdminField label={c.club} htmlFor="club">
              <input id="club" name="club" maxLength={120} defaultValue={player.club ?? ""} autoComplete="off" className={adminInputClass} />
            </AdminField>
            <AdminField label={c.level} htmlFor="level">
              <select id="level" name="level" defaultValue={player.level ?? ""} className={adminInputClass}>
                <option value="">{p.notSet}</option>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label={p.genderField} htmlFor="gender">
              <select id="gender" name="gender" defaultValue={player.gender ?? ""} className={adminInputClass}>
                <option value="">{p.notSet}</option>
                {genderOptions.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          {player.referralSource && (
            <p className="text-sm text-ink-muted">
              {p.referral}: <span className="text-ink">{player.referralSource}</span>
            </p>
          )}
        </ActionForm>
      </Card>

      <Card title={p.notesTitle} hint={p.notesHint}>
        <ActionForm action={savePlayerNotes.bind(null, player.id)} submitLabel={p.saveNotes}>
          <label htmlFor="internalNotes" className="sr-only">
            {p.notesTitle}
          </label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            rows={4}
            maxLength={2000}
            defaultValue={player.internalNotes ?? ""}
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
