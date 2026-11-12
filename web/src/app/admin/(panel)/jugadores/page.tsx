import type { Metadata } from "next";
import Link from "next/link";
import { Download, MessageCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { levelOptions } from "@/content/forms";
import { distinctOptions, hasActiveFilters, parsePlayerFilters, playerFiltersQuery, playerWhere } from "@/lib/player-filters";
import { waNumber } from "@/lib/registration-admin-rules";
import { adminInputClass } from "@/components/admin/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Jugadores" };
const c = adminCopy.players;
const PAGE = 50;

export default async function PlayersPage({ searchParams }: PageProps<"/admin/jugadores">) {
  await requireAdmin();
  const sp = await searchParams;
  const f = parsePlayerFilters(sp);
  const pages = Math.min(20, Math.max(1, Number(typeof sp.pagina === "string" ? sp.pagina : 1) || 1));
  const where = playerWhere(f);

  const [players, matching, consenting, totalAll, places] = await Promise.all([
    db.player.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE * pages,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        whatsapp: true,
        city: true,
        club: true,
        level: true,
        marketingConsent: true,
        _count: { select: { registrations: true } },
      },
    }),
    db.player.count({ where }),
    db.player.count({ where: playerWhere(f, { onlyConsent: true }) }),
    db.player.count(),
    db.player.findMany({ select: { city: true, club: true, level: true } }),
  ]);

  const cities = distinctOptions(places.map((p) => p.city));
  const clubs = distinctOptions(places.map((p) => p.club));
  const levels = distinctOptions([...levelOptions, ...places.map((p) => p.level)]);
  const active = hasActiveFilters(f);
  const filterCount = [f.city, f.club, f.level, f.consent].filter(Boolean).length;
  const qs = playerFiltersQuery(f);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-navy-900">{c.title}</h1>
        <p className="mt-2 text-ink-muted">
          {c.intro} {totalAll > 0 && <span className="font-semibold text-navy-900">{c.total(totalAll)}.</span>}
        </p>
      </div>

      {totalAll === 0 ? (
        <p className="rounded-sm bg-white p-5 text-ink-muted">{c.none}</p>
      ) : (
        <>
          {/* Un solo formulario GET: búsqueda + filtros en la URL. */}
          <form action="/admin/jugadores" role="search" className="space-y-3">
            <div className="flex gap-2">
              <label htmlFor="q" className="sr-only">
                {c.search}
              </label>
              <input id="q" name="q" type="search" defaultValue={f.q} placeholder={c.search} className={adminInputClass} />
              <button
                type="submit"
                aria-label={c.searchButton}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-sm bg-navy-900 text-white hover:bg-navy-800"
              >
                <Search aria-hidden className="size-5" />
              </button>
            </div>

            <details open={filterCount > 0} className="group rounded-sm border border-border bg-white">
              <summary className="flex h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal aria-hidden className="size-4" />
                {c.filtersTitle}
                {filterCount > 0 && (
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-navy-900 text-xs text-white">{filterCount}</span>
                )}
              </summary>
              <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-3">
                <FilterSelect id="ciudad" label={c.city} value={f.city} options={cities} />
                <FilterSelect id="club" label={c.club} value={f.club} options={clubs} />
                <FilterSelect id="nivel" label={c.level} value={f.level} options={levels} />
                <label className="flex min-h-11 items-center gap-3 text-sm text-navy-900 sm:col-span-3">
                  <input type="checkbox" name="consentimiento" value="1" defaultChecked={f.consent} className="size-5 accent-navy-900" />
                  {c.consentOnly}
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
                  <button type="submit" className="inline-flex h-12 items-center rounded-sm bg-navy-900 px-6 text-sm font-semibold text-white hover:bg-navy-800">
                    {c.apply}
                  </button>
                </div>
              </div>
            </details>
          </form>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <p className="text-ink-muted">{active ? c.total(matching) : c.total(totalAll)}</p>
            {active && (
              <Link href="/admin/jugadores" className="inline-flex min-h-11 items-center gap-1 text-navy-900 underline underline-offset-4">
                <X aria-hidden className="size-4" /> {c.clear}
              </Link>
            )}
          </div>

          {/* Export: solo con consentimiento de comunicaciones. */}
          <div className="rounded-sm bg-white p-4">
            {consenting > 0 ? (
              <>
                <a
                  href={`/admin/jugadores/exportar${qs ? `?${qs}` : ""}`}
                  className="inline-flex h-12 items-center gap-2 rounded-sm border border-border bg-white px-5 text-sm font-semibold text-navy-900 hover:border-navy-900"
                >
                  <Download aria-hidden className="size-4" /> {c.exportCsv}
                </a>
                <p className="mt-2 text-sm text-ink-muted">{c.exportHint(consenting)}</p>
              </>
            ) : (
              <p className="text-sm text-ink-muted">{c.exportNone}</p>
            )}
          </div>

          {players.length === 0 ? (
            <p className="text-ink-muted">{c.empty}</p>
          ) : (
            <ul className="space-y-3">
              {players.map((p) => {
                const wa = waNumber(p.whatsapp);
                const meta = [p.city, p.club, p.level].filter(Boolean).join(" · ");
                return (
                  <li key={p.id} className="relative flex items-start gap-3 rounded-sm border border-border bg-white p-4 hover:border-navy-900">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-navy-900">
                        <Link href={`/admin/jugadores/${p.id}`} className="after:absolute after:inset-0">
                          {p.firstName} {p.lastName}
                        </Link>
                      </h2>
                      {meta && <p className="mt-1 truncate text-sm text-ink">{meta}</p>}
                      <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-ink-muted">
                        <span>{c.experiences(p._count.registrations)}</span>
                        <span className={cn(p.marketingConsent ? "text-emerald-800" : "text-ink-muted")}>
                          {p.marketingConsent ? c.consentYes : c.consentNo}
                        </span>
                      </p>
                    </div>
                    {wa && (
                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp a ${p.firstName}`}
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

          {players.length < matching && (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-ink-muted">{c.showing(players.length, matching)}</p>
              <Link
                href={`/admin/jugadores?${new URLSearchParams([...new URLSearchParams(qs), ["pagina", String(pages + 1)]])}`}
                scroll={false}
                className="inline-flex h-12 items-center rounded-sm border border-navy-900 px-6 text-sm font-semibold text-navy-900 hover:bg-cream"
              >
                {c.showMore}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterSelect({ id, label, value, options }: { id: string; label: string; value: string; options: string[] }) {
  // Si el valor de la URL no está entre las opciones (p. ej. distinto en mayúsculas), lo mostramos igual.
  const all = value && !options.some((o) => o.toLowerCase() === value.toLowerCase()) ? [value, ...options] : options;
  const selected = all.find((o) => o.toLowerCase() === value.toLowerCase()) ?? "";
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-navy-900">
        {label}
      </label>
      <select id={id} name={id} defaultValue={selected} className={adminInputClass}>
        <option value="">{c.any}</option>
        {all.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
