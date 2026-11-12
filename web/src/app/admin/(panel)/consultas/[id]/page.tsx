import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDate } from "@/lib/format";
import { leadNextStatuses, type LeadStatus } from "@/lib/lead-rules";
import { waNumber } from "@/lib/registration-admin-rules";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusActions } from "@/components/admin/status-actions";
import { ActionForm } from "@/components/admin/action-form";
import { adminInputClass } from "@/components/admin/styles";
import { saveLeadNotes, setLeadStatus } from "../actions";

export const metadata: Metadata = { title: "Consulta" };
const c = adminCopy.leads;

export default async function LeadPage({ params }: PageProps<"/admin/consultas/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const wa = waNumber(lead.whatsapp);
  const firstName = lead.name.split(/\s+/)[0];
  const waText = encodeURIComponent(c.whatsappGreeting(firstName));
  const mailto = `mailto:${lead.email}?subject=${encodeURIComponent(c.emailSubject)}`;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/consultas" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted hover:text-navy-900">
          <ArrowLeft aria-hidden className="size-4" /> {c.back}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl text-navy-900">{lead.name}</h1>
          <StatusBadge status={lead.status} kind="lead" />
        </div>
        <p className="mt-1 text-ink-muted">
          {c.type[lead.type]}
          {lead.organization && <> · {lead.organization}</>} · {c.receivedOn(formatDate(lead.createdAt))}
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
            href={mailto}
            className="inline-flex h-12 items-center gap-2 rounded-sm border border-border bg-white px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
          >
            <Mail aria-hidden className="size-4" /> {c.email}
          </a>
        </div>
      </div>

      <Card title={c.messageTitle}>
        <p className="leading-relaxed whitespace-pre-line text-ink">{lead.message}</p>
      </Card>

      <Card title={c.statusTitle} hint={c.statusHint}>
        <StatusActions
          action={setLeadStatus.bind(null, lead.id)}
          options={leadNextStatuses(lead.status as LeadStatus).map((to) => ({
            value: to,
            label: c.statusAction[to],
            variant: to === "CERRADO" ? "secondary" : to === "NUEVO" ? "secondary" : "primary",
          }))}
        />
      </Card>

      <Card title={c.detailsTitle}>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label={c.emailField} value={lead.email} />
          <Row label={c.whatsappField} value={lead.whatsapp} />
          <Row label={c.organization} value={lead.organization} />
          <Row label={c.consent} value={lead.consent ? c.yes : c.no} />
        </dl>
      </Card>

      <Card title={c.notesTitle} hint={c.notesHint}>
        <ActionForm action={saveLeadNotes.bind(null, lead.id)} submitLabel={c.saveNotes}>
          <label htmlFor="internalNotes" className="sr-only">
            {c.notesTitle}
          </label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            rows={5}
            maxLength={3000}
            defaultValue={lead.internalNotes ?? ""}
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

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-ink">{value || "—"}</dd>
    </div>
  );
}
