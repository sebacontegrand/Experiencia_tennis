import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { formatDate } from "@/lib/format";
import { LEAD_STATUSES, LEAD_TYPES, leadFiltersQuery, parseLeadFilters } from "@/lib/lead-rules";
import { waNumber } from "@/lib/registration-admin-rules";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Consultas" };
const c = adminCopy.leads;

export default async function LeadsPage({ searchParams }: PageProps<"/admin/consultas">) {
  await requireAdmin();
  const f = parseLeadFilters(await searchParams);

  const [leads, byStatus, total, types] = await Promise.all([
    db.lead.findMany({
      where: { ...(f.estado ? { status: f.estado } : {}), ...(f.tipo ? { type: f.tipo } : {}) },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, organization: true, type: true, status: true, message: true, whatsapp: true, createdAt: true },
    }),
    db.lead.groupBy({ by: ["status"], where: f.tipo ? { type: f.tipo } : {}, _count: { _all: true } }),
    db.lead.count(),
    db.lead.groupBy({ by: ["type"], _count: { _all: true } }),
  ]);
  const countOf = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;
  const allCount = byStatus.reduce((n, r) => n + r._count._all, 0);
  const presentTypes = LEAD_TYPES.filter((t) => types.some((r) => r.type === t));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-navy-900">{c.title}</h1>
        <p className="mt-2 text-ink-muted">{c.intro}</p>
      </div>

      {total === 0 ? (
        <p className="rounded-sm bg-white p-5 text-ink-muted">{c.none}</p>
      ) : (
        <>
          {/* Estados: links, así funcionan sin JavaScript y se pueden compartir. */}
          <nav aria-label="Filtrar por estado" className="-mx-4 overflow-x-auto px-4">
            <ul className="flex gap-2 pb-1">
              {[null, ...LEAD_STATUSES].map((s) => {
                const active = s === f.estado;
                return (
                  <li key={s ?? "all"}>
                    <Link
                      href={`/admin/consultas${leadFiltersQuery({ estado: s, tipo: f.tipo })}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm whitespace-nowrap",
                        active ? "border-navy-900 bg-navy-900 text-white" : "border-border bg-white text-navy-900 hover:border-navy-900",
                      )}
                    >
                      {s ? c.status[s] : c.all}
                      <span className={cn("text-xs", active ? "text-white/80" : "text-ink-muted")}>{s ? countOf(s) : allCount}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {presentTypes.length > 1 && (
            <nav aria-label={c.filterType} className="-mx-4 overflow-x-auto px-4">
              <ul className="flex gap-2 pb-1">
                {[null, ...presentTypes].map((t) => {
                  const active = t === f.tipo;
                  return (
                    <li key={t ?? "all"}>
                      <Link
                        href={`/admin/consultas${leadFiltersQuery({ estado: f.estado, tipo: t })}`}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "inline-flex h-10 items-center rounded-sm border px-3 text-sm whitespace-nowrap",
                          active ? "border-navy-900 font-semibold text-navy-900" : "border-transparent text-ink-muted hover:text-navy-900",
                        )}
                      >
                        {t ? c.type[t] : c.allTypes}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {leads.length === 0 ? (
            <p className="text-ink-muted">{c.empty}</p>
          ) : (
            <ul className="space-y-3">
              {leads.map((l) => {
                const wa = waNumber(l.whatsapp);
                return (
                  <li key={l.id} className="relative flex items-start gap-3 rounded-sm border border-border bg-white p-4 hover:border-navy-900">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-navy-900">
                          <Link href={`/admin/consultas/${l.id}`} className="after:absolute after:inset-0">
                            {l.name}
                          </Link>
                        </h2>
                        <StatusBadge status={l.status} kind="lead" />
                      </div>
                      <p className="mt-1 text-sm text-ink">
                        {c.type[l.type]}
                        {l.organization && <> · {l.organization}</>}
                        <span className="text-ink-muted"> · {formatDate(l.createdAt)}</span>
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{l.message}</p>
                    </div>
                    {wa && (
                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp a ${l.name}`}
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
        </>
      )}
    </div>
  );
}
