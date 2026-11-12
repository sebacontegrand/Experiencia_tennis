import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, MessageCircle, Search } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDateRange, formatPrice } from "@/lib/format";
import { amountPaid, isRegistrationStatus, REGISTRATION_STATUSES, waNumber } from "@/lib/registration-admin-rules";
import { waitlistSuggestion } from "@/lib/registration-admin";
import { StatusBadge } from "@/components/admin/status-badge";
import { adminInputClass } from "@/components/admin/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Inscripciones" };
const c = adminCopy.registrations;

export default async function RegistrationsPage({ params, searchParams }: PageProps<"/admin/experiencias/[id]/inscripciones">) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const estado = typeof sp.estado === "string" && isRegistrationStatus(sp.estado) ? sp.estado : null;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";

  const exp = await db.experience.findUnique({ where: { id }, select: { id: true, title: true, startDate: true, endDate: true, capacity: true } });
  if (!exp) notFound();

  const where: Prisma.RegistrationWhereInput = { experienceId: exp.id };
  if (estado) where.status = estado;
  if (q) {
    const contains = { contains: q, mode: "insensitive" as const };
    where.player = {
      OR: [{ firstName: contains }, { lastName: contains }, { email: contains }, { whatsapp: { contains: q.replace(/\D/g, "") || q } }],
    };
  }

  const [registrations, byStatus, suggestion] = await Promise.all([
    db.registration.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        player: { select: { firstName: true, lastName: true, whatsapp: true } },
        priceOption: { select: { label: true, price: true } },
        payments: { select: { amount: true, status: true } },
      },
    }),
    db.registration.groupBy({ by: ["status"], where: { experienceId: exp.id }, _count: { _all: true } }),
    waitlistSuggestion(exp.id, exp.capacity),
  ]);
  const total = byStatus.reduce((n, r) => n + r._count._all, 0);
  const countOf = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;
  const base = `/admin/experiencias/${exp.id}/inscripciones`;
  const filterHref = (s: string | null) => {
    const u = new URLSearchParams();
    if (s) u.set("estado", s);
    if (q) u.set("q", q);
    const qs = u.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/experiencias/${exp.id}`} className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-navy-900">
          <ArrowLeft aria-hidden className="size-4" /> {c.back}
        </Link>
        <h1 className="mt-6 font-serif text-4xl text-navy-900">{c.title}</h1>
        <p className="mt-1 text-ink-muted">
          {exp.title} · {formatDateRange(exp.startDate, exp.endDate)}
        </p>
      </div>

      {suggestion && (
        <div className="flex flex-col gap-3 rounded-sm bg-violet-50 p-4 text-sm text-violet-950 sm:flex-row sm:items-center sm:justify-between">
          <p>{c.waitlistBanner(suggestion.free, `${suggestion.first.player.firstName} ${suggestion.first.player.lastName}`)}</p>
          <Link href={`/admin/inscripciones/${suggestion.first.id}`} className="shrink-0 font-semibold underline underline-offset-4">
            {c.waitlistCta}
          </Link>
        </div>
      )}

      {total > 0 && (
        <a
          href={`/admin/experiencias/${exp.id}/nomina`}
          className="inline-flex h-12 items-center gap-2 rounded-sm border border-border bg-white px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
        >
          <Download aria-hidden className="size-4" /> {c.exportCsv}
        </a>
      )}

      {/* Filtros por estado: links, así funcionan sin JavaScript y se pueden compartir. */}
      <nav aria-label="Filtrar por estado" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2 pb-1">
          {[null, ...REGISTRATION_STATUSES].map((s) => {
            const active = s === estado;
            const n = s ? countOf(s) : total;
            return (
              <li key={s ?? "all"}>
                <Link
                  href={filterHref(s)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm whitespace-nowrap",
                    active ? "border-navy-900 bg-navy-900 text-white" : "border-border bg-white text-navy-900 hover:border-navy-900",
                  )}
                >
                  {s ? adminCopy.registrationStatus[s] : c.all}
                  <span className={cn("text-xs", active ? "text-white/80" : "text-ink-muted")}>{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form action={base} className="flex gap-2" role="search">
        {estado && <input type="hidden" name="estado" value={estado} />}
        <label htmlFor="q" className="sr-only">
          {c.search}
        </label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder={c.search} className={adminInputClass} />
        <button type="submit" aria-label={c.searchButton} className="inline-flex size-12 shrink-0 items-center justify-center rounded-sm bg-navy-900 text-white">
          <Search aria-hidden className="size-5" />
        </button>
      </form>
      {q && (
        <p className="text-sm text-ink-muted">
          {c.count(registrations.length)} ·{" "}
          <Link href={filterHref(estado)} className="underline underline-offset-4" prefetch={false}>
            {c.clear}
          </Link>
        </p>
      )}

      {registrations.length === 0 ? (
        <p className="text-ink-muted">{total === 0 ? c.none : c.empty}</p>
      ) : (
        <ul className="space-y-3">
          {registrations.map((r) => {
            const paid = amountPaid(r.payments);
            const wa = waNumber(r.player.whatsapp);
            const price = r.priceOption?.price;
            return (
              <li key={r.id} className="relative flex items-start gap-3 rounded-sm border border-border bg-white p-4 hover:border-navy-900">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-navy-900">
                      <Link href={`/admin/inscripciones/${r.id}`} className="after:absolute after:inset-0">
                        {r.player.firstName} {r.player.lastName}
                      </Link>
                    </h2>
                    <StatusBadge status={r.status} kind="registration" />
                  </div>
                  <p className="mt-1 truncate text-sm text-ink">{r.priceOption?.label ?? c.noOption}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {price != null ? c.paidOf(formatPrice(paid), formatPrice(price)) : paid > 0 ? `Pagó ${formatPrice(paid)}` : c.noPrice}
                  </p>
                </div>
                {wa && (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp a ${r.player.firstName}`}
                    className="relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  >
                    <MessageCircle aria-hidden className="size-5" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
